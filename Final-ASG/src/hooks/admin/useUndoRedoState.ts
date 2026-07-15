import { useState, useCallback } from "react";

export interface UndoRedoAction {
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

// Overload signatures
export function useUndoRedoState<T>(initialValue: T): [
  T,
  (val: T | ((prev: T) => T)) => void,
  () => void,
  () => void,
  boolean,
  boolean,
  (val: T | ((prev: T) => T)) => void
];
export function useUndoRedoState(): {
  pushAction: (action: UndoRedoAction) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  isProcessing: boolean;
};

// Implementation
export function useUndoRedoState(initialValue?: any): any {
  // If initialValue is provided, run the state-based logic
  if (initialValue !== undefined) {
    const [present, setPresent] = useState<any>(initialValue);
    const [past, setPast] = useState<any[]>([]);
    const [future, setFuture] = useState<any[]>([]);

    const updateState = useCallback((newVal: any) => {
      setPresent((prev: any) => {
        const resolved = typeof newVal === "function" ? (newVal as Function)(prev) : newVal;
        setPast((p: any) => [...p, prev]);
        setFuture([]);
        return resolved;
      });
    }, []);

    const undo = useCallback(() => {
      setPast((prevPast: any[]) => {
        if (prevPast.length === 0) return prevPast;
        const previous = prevPast[prevPast.length - 1];
        const newPast = prevPast.slice(0, prevPast.length - 1);
        
        setPresent((prevPresent: any) => {
          setFuture((prevFuture: any[]) => [prevPresent, ...prevFuture]);
          return previous;
        });
        
        return newPast;
      });
    }, []);

    const redo = useCallback(() => {
      setFuture((prevFuture: any[]) => {
        if (prevFuture.length === 0) return prevFuture;
        const next = prevFuture[0];
        const newFuture = prevFuture.slice(1);
        
        setPresent((prevPresent: any) => {
          setPast((prevPast: any[]) => [...prevPast, prevPresent]);
          return next;
        });
        
        return newFuture;
      });
    }, []);

    const resetState = useCallback((newVal: any) => {
      setPresent(newVal);
      setPast([]);
      setFuture([]);
    }, []);

    return [
      present,
      updateState,
      undo,
      redo,
      past.length > 0,
      future.length > 0,
      resetState,
    ];
  }

  // Otherwise, run the action-based logic
  const [pastActions, setPastActions] = useState<UndoRedoAction[]>([]);
  const [futureActions, setFutureActions] = useState<UndoRedoAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const pushAction = useCallback((action: UndoRedoAction) => {
    setPastActions((prev) => [...prev, action]);
    setFutureActions([]);
  }, []);

  const undoAction = useCallback(async () => {
    if (pastActions.length === 0 || isProcessing) return;
    setIsProcessing(true);
    const action = pastActions[pastActions.length - 1];
    try {
      await action.undo();
      setPastActions((prev) => prev.slice(0, prev.length - 1));
      setFutureActions((prev) => [action, ...prev]);
    } catch (error) {
      console.error("Undo failed", error);
    } finally {
      setIsProcessing(false);
    }
  }, [pastActions, isProcessing]);

  const redoAction = useCallback(async () => {
    if (futureActions.length === 0 || isProcessing) return;
    setIsProcessing(true);
    const action = futureActions[0];
    try {
      await action.redo();
      setFutureActions((prev) => prev.slice(1));
      setPastActions((prev) => [...prev, action]);
    } catch (error) {
      console.error("Redo failed", error);
    } finally {
      setIsProcessing(false);
    }
  }, [futureActions, isProcessing]);

  return {
    pushAction,
    undo: undoAction,
    redo: redoAction,
    canUndo: pastActions.length > 0,
    canRedo: futureActions.length > 0,
    isProcessing,
  };
}

import { test, expect } from './helpers';

test.describe('AAL / Interns Management', () => {
  test.beforeEach(async ({ page }) => {
    let interns = [
      {
        id: '11111111-2222-3333-4444-555555555555',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 99999 88888',
        college: 'SSBT COET',
        course: 'B.E. Computer',
        year: '4th Year',
        domain: 'Career Intelligence',
        mentor: 'Dr. Sandeep Joshi',
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        githubUrl: 'https://github.com/johndoe',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    let problems = [
      {
        id: '99999999-8888-7777-6666-555555555555',
        title: 'Mock Problem',
        description: 'Mock Description',
        icon: '💡',
        status: 'Active'
      }
    ];

    // GET / POST / PATCH / DELETE admin interns
    await page.route(url => url.pathname === '/api/v1/admin/interns', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: interns })
        });
      } else if (method === 'POST') {
        const body = route.request().postDataJSON();
        const newIntern = {
          id: '22222222-3333-4444-5555-666666666666',
          ...body,
          createdAt: new Date().toISOString()
        };
        interns.push(newIntern);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: newIntern })
        });
      } else if (method === 'PATCH') {
        const body = route.request().postDataJSON();
        interns = interns.map(i => i.id === body.id ? { ...i, name: body.name || i.name, domain: body.domain || i.domain } : i);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: body })
        });
      } else if (method === 'DELETE') {
        const url = new URL(route.request().url());
        const id = url.searchParams.get('id');
        interns = interns.filter(i => i.id !== id);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    // GET / POST / PATCH / DELETE admin problem-statements
    await page.route(url => url.pathname === '/api/v1/admin/problem-statements', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: problems })
        });
      } else if (method === 'POST') {
        const body = route.request().postDataJSON();
        const newProblem = {
          id: '88888888-7777-6666-5555-444444444444',
          ...body,
          status: 'Active'
        };
        problems.push(newProblem);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: newProblem })
        });
      }
    });

    // GET public interns
    await page.route(url => url.pathname === '/api/v1/interns', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: interns })
      });
    });

    // GET public problem-statements
    await page.route(url => url.pathname === '/api/v1/problem-statements', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: problems })
      });
    });

    // Mock applications
    await page.route(url => url.pathname === '/api/v1/admin/applications', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
  });

  test('should display the list of interns', async ({ page }) => {
    await page.goto('/dashboard/aal');
    await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 15000 });
  });

  test('should validate form and show that empty required fields prevent saving', async ({ page }) => {
    await page.goto('/dashboard/aal');
    
    // Switch to Problem Statement tab
    const tabBtn = page.locator('button').filter({ hasText: 'Problem Statement' }).first();
    await tabBtn.click();

    // Click Add Problem Statement button
    const addBtn = page.locator('button').filter({ hasText: 'Add Problem Statement' }).first();
    await addBtn.click();
    
    // Try saving empty
    const saveBtn = page.locator('button').filter({ hasText: 'Add Problem Statement' }).last();
    await saveBtn.click();
    
    // Modal remains open
    await expect(page.locator('h3', { hasText: 'Add Problem Statement' })).toBeVisible();
  });

  test('should allow creating a new problem statement', async ({ page }) => {
    await page.goto('/dashboard/aal');

    const tabBtn = page.locator('button').filter({ hasText: 'Problem Statement' }).first();
    await tabBtn.click();

    const addBtn = page.locator('button').filter({ hasText: 'Add Problem Statement' }).first();
    await addBtn.click();
    
    await page.locator('input[placeholder="Problem statement title"]').fill('New AI Problem');
    await page.locator('textarea[placeholder="Detailed description of the problem…"]').fill('This is a description');
    
    const saveBtn = page.locator('button').filter({ hasText: 'Add Problem Statement' }).last();
    await saveBtn.click();
  });

  test('should support editing an intern', async ({ page }) => {
    await page.goto('/dashboard/aal');
    const editBtn = page.locator('button[title="Edit Details"]').first();
    await editBtn.click();
    
    const nameInput = page.locator('input[placeholder="Full name"]');
    await expect(nameInput).toHaveValue('John Doe');
    await nameInput.fill('Johnathan Doe');
    
    const saveBtn = page.locator('button').filter({ hasText: 'Save Changes' }).first();
    await saveBtn.click();
    
    await page.goto('/listings/interns');
    await expect(page.locator('text=Johnathan Doe')).toBeVisible({ timeout: 15000 });
  });

  test('should support deleting an intern', async ({ page }) => {
    await page.goto('/dashboard/aal');
    const deleteBtn = page.locator('button[title="Remove Intern"]').first();
    await deleteBtn.click();
    
    const confirmBtn = page.locator('button').filter({ hasText: 'Remove' }).first();
    await confirmBtn.click();
    
    await page.goto('/listings/interns');
    await expect(page.locator('text=John Doe')).not.toBeVisible({ timeout: 15000 });
  });
});

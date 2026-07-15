import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, blogs, galleryPhotos, interns, problemStatements, communityMembers } from '@/lib/db/schema';
import { count, desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // 1. Fetch counts
    const [
      eventsCount,
      upcomingCount,
      blogsCount,
      galleryCount,
      internsCount,
      problemsCount,
      communityCount
    ] = await Promise.all([
      db.select({ value: count() }).from(events),
      db.select({ value: count() }).from(events).where(eq(events.status, 'upcoming')),
      db.select({ value: count() }).from(blogs),
      db.select({ value: count() }).from(galleryPhotos),
      db.select({ value: count() }).from(interns),
      db.select({ value: count() }).from(problemStatements),
      db.select({ value: count() }).from(communityMembers)
    ]);

    // 2. Fetch Recent Events
    const recentEventsRaw = await db
      .select({
        title: events.title,
        scheduledDate: events.scheduledDate,
        venue: events.venue,
        status: events.status,
        createdAt: events.createdAt
      })
      .from(events)
      .orderBy(desc(events.createdAt))
      .limit(5);
      
    const recentEvents = recentEventsRaw.map(e => ({
      title: e.title,
      date: e.scheduledDate ? new Date(e.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
      location: e.venue || 'Online',
      status: e.status || 'Upcoming',
      attendees: Math.floor(Math.random() * 100) + 50 // Mocking attendees for now since it's not in schema
    }));

    // 3. Fetch Recent Blogs
    const recentBlogsRaw = await db
      .select({
        title: blogs.title,
        author: blogs.author,
        createdAt: blogs.createdAt,
        status: blogs.status,
      })
      .from(blogs)
      .orderBy(desc(blogs.createdAt))
      .limit(3);
      
    const recentBlogs = recentBlogsRaw.map(b => ({
      title: b.title,
      author: b.author || 'Admin',
      date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
      status: b.status || 'Published'
    }));

    // 4. Fetch College Distribution
    const collegeDataRaw = await db
      .select({
        name: interns.college,
        students: count(),
      })
      .from(interns)
      .groupBy(interns.college);

    const BASELINE_COLLEGES = [
      "GCOEJ",
      "SSBT COET",
      "KCES COE",
      "GF COE",
      "M. J. College",
      "IMR College"
    ];

    // Initialize map with baseline colleges having 0 students
    const collegeMap = new Map<string, number>();
    BASELINE_COLLEGES.forEach(c => collegeMap.set(c, 0));
    let othersCount = 0;

    collegeDataRaw.forEach(item => {
      if (!item.name) return;
      const lowerName = item.name.toLowerCase().trim();
      
      let matchedKey = "";
      if (lowerName.includes("ssbt")) {
        matchedKey = "SSBT COET";
      } else if (lowerName.includes("gcoej") || lowerName.includes("government college of engineering")) {
        matchedKey = "GCOEJ";
      } else if (lowerName.includes("kce")) {
        matchedKey = "KCES COE";
      } else if (lowerName.includes("godavari") || lowerName.includes("gf")) {
        matchedKey = "GF COE";
      } else if (lowerName.includes("mj") || lowerName.includes("m. j.") || lowerName.includes("moolji") || lowerName.includes("jaitha")) {
        matchedKey = "M. J. College";
      } else if (lowerName.includes("imr")) {
        matchedKey = "IMR College";
      } else {
        // Fallback to exact case-insensitive match check
        const exactMatch = BASELINE_COLLEGES.find(
          c => c.toLowerCase() === lowerName
        );
        if (exactMatch) matchedKey = exactMatch;
      }

      if (matchedKey) {
        collegeMap.set(matchedKey, (collegeMap.get(matchedKey) || 0) + Number(item.students));
      } else {
        othersCount += Number(item.students);
      }
    });

    const collegeData = Array.from(collegeMap.entries()).map(([name, students]) => ({
      name,
      students
    }));

    if (othersCount > 0) {
      collegeData.push({ name: 'Others', students: othersCount });
    }

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          events: eventsCount[0].value,
          upcoming: upcomingCount[0].value,
          blogs: blogsCount[0].value,
          gallery: galleryCount[0].value,
          interns: internsCount[0].value,
          problems: problemsCount[0].value,
          community: communityCount[0].value,
        },
        recentEvents,
        recentBlogs,
        collegeData
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

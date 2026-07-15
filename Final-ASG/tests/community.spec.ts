import { test, expect } from './helpers';

test.describe('Community Members Management', () => {
  test.beforeEach(async ({ page }) => {
    let members = [
      {
        id: '11111111-2222-3333-4444-555555555555',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+91 99999 77777',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        designation: 'Managing Director',
        company: 'Venture Capital Corp',
        memberType: 'mentor',
        linkedinUrl: 'https://linkedin.com/in/janedoe',
        websiteUrl: 'https://venturecapital.corp',
        bio: 'Experienced startup advisor and early stage investor.',
        showOnWebsite: true,
        displayOrder: 0,
        createdAt: new Date().toISOString()
      }
    ];

    // GET / POST / PATCH / DELETE admin/community-members
    await page.route(url => url.pathname === '/api/v1/admin/community-members', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: members })
        });
      } else if (method === 'POST') {
        const body = route.request().postDataJSON();
        const newMember = {
          id: '22222222-3333-4444-5555-666666666666',
          ...body,
          memberType: body.type === 'Mentor' ? 'mentor' : 'founder',
          showOnWebsite: body.showOnWebsite !== undefined ? body.showOnWebsite : true,
          createdAt: new Date().toISOString()
        };
        members.push(newMember);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: newMember })
        });
      } else if (method === 'PATCH') {
        const body = route.request().postDataJSON();
        members = members.map(m => m.id === body.id ? { ...m, ...body } : m);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: body })
        });
      } else if (method === 'DELETE') {
        const url = new URL(route.request().url());
        const id = url.searchParams.get('id');
        members = members.filter(m => m.id !== id);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    // GET public community-members
    await page.route(url => url.pathname === '/api/v1/community-members', async (route) => {
      const activeMembers = members.filter(m => m.showOnWebsite === true);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: activeMembers })
      });
    });

    // Mock applications
    await page.route(url => url.pathname === '/api/v1/admin/community-applications', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
  });

  test('should display existing community members in the dashboard list', async ({ page }) => {
    await page.goto('/dashboard/community');
    const mentorsTab = page.locator('button').filter({ hasText: 'Mentor' }).first();
    await mentorsTab.click();

    await expect(page.locator('text=Jane Doe')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Venture Capital Corp')).toBeVisible();
  });

  test('should validate form and show error/prevent submit on missing required inputs', async ({ page }) => {
    await page.goto('/dashboard/community');
    
    // Default activeTab is Founder, so button text is "Add Founder"
    const addBtn = page.locator('button').filter({ hasText: 'Add Founder' }).first();
    await addBtn.click();

    const saveBtn = page.locator('button').filter({ hasText: 'Add Founder' }).last();
    await saveBtn.click();

    await expect(page.locator('h3', { hasText: 'Add Founder' })).toBeVisible();
  });

  test('should support creating a new member, displaying them in public listings', async ({ page }) => {
    await page.goto('/dashboard/community');
    
    // Switch to Mentor Tab
    const mentorsTab = page.locator('button').filter({ hasText: 'Mentor' }).first();
    await mentorsTab.click();

    const addBtn = page.locator('button').filter({ hasText: 'Add Mentor' }).first();
    await addBtn.click();

    await page.locator('input[placeholder="Full name"]').fill('Robert Brown');
    await page.locator('input[placeholder="email@example.com"]').fill('robert@example.com');
    await page.locator('input[placeholder="Company name"]').fill('Tech Labs');
    await page.locator('input[placeholder="e.g. CEO, Co-founder, Partner"]').fill('Tech Mentor');

    const saveBtn = page.locator('button').filter({ hasText: 'Add Mentor' }).last();
    await saveBtn.click();

    await page.goto('/listings/mentors');
    await expect(page.locator('text=Robert Brown').first()).toBeVisible({ timeout: 15000 });
  });

  test('should respect the "Show on Website" flag visibility settings', async ({ page }) => {
    await page.goto('/dashboard/community');
    const mentorsTab = page.locator('button').filter({ hasText: 'Mentor' }).first();
    await mentorsTab.click();

    const editBtn = page.locator('button[title="Edit Details"]').first();
    await editBtn.click();

    await page.locator('select').nth(1).selectOption('Inactive');

    const saveBtn = page.locator('button').filter({ hasText: 'Save Changes' }).first();
    await saveBtn.click();

    await page.goto('/listings/mentors');
    await expect(page.locator('text=Jane Doe')).not.toBeVisible({ timeout: 15000 });
  });
});

import { test as base } from '@playwright/test';
import { DBHelper } from '../utils/db.helper.js';

export const test = base.extend({
    db: async ({ }, use) => {
        await use(DBHelper);
    },
});

export { expect } from '@playwright/test';
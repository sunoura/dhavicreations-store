import { beforeAll, afterAll, vi } from 'vitest';
import { db } from '$lib/server/db';
import {
	admin,
	adminSession,
	images,
	imageTags,
	categories,
	products,
	productTags,
	productImages
} from '$lib/server/db/schema';

// Test database setup
beforeAll(async () => {
	// Clean up any existing test data
	await db.delete(productImages);
	await db.delete(productTags);
	await db.delete(products);
	await db.delete(categories);
	await db.delete(imageTags);
	await db.delete(images);
	await db.delete(adminSession);
	await db.delete(admin);
});

// Test database cleanup
afterAll(async () => {
	// Clean up test data after all tests
	await db.delete(productImages);
	await db.delete(productTags);
	await db.delete(products);
	await db.delete(categories);
	await db.delete(imageTags);
	await db.delete(images);
	await db.delete(adminSession);
	await db.delete(admin);
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock FormData for API tests
global.FormData = class FormData {
	private data: Map<string, string> = new Map();

	append(key: string, value: string) {
		this.data.set(key, value);
	}

	get(key: string): string | null {
		return this.data.get(key) || null;
	}

	has(key: string): boolean {
		return this.data.has(key);
	}

	delete(key: string) {
		this.data.delete(key);
	}

	entries(): IterableIterator<[string, string]> {
		return this.data.entries();
	}

	keys(): IterableIterator<string> {
		return this.data.keys();
	}

	values(): IterableIterator<string> {
		return this.data.values();
	}

	forEach(callback: (value: string, key: string, parent: FormData) => void) {
		this.data.forEach((value, key) => callback(value, key, this));
	}
} as any;

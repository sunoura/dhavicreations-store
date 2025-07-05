import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '$lib/server/db';
import {
	admin,
	adminSession,
	images,
	imageTags,
	categories,
	products,
	productTags,
	productImages,
	type NewAdmin,
	type NewImage,
	type NewCategory,
	type NewProduct
} from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper to generate unique strings for test data
function unique(str: string) {
	return `${str}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('Database Schema Tests', () => {
	beforeEach(async () => {
		// Clean up all tables in dependency order
		await db.delete(productImages);
		await db.delete(productTags);
		await db.delete(imageTags);
		await db.delete(products);
		await db.delete(images);
		await db.delete(categories);
		await db.delete(admin);
	});

	afterEach(async () => {
		// Clean up all tables in dependency order
		await db.delete(productImages);
		await db.delete(productTags);
		await db.delete(imageTags);
		await db.delete(products);
		await db.delete(images);
		await db.delete(categories);
		await db.delete(admin);
	});

	describe('Admin Table', () => {
		it('should create an admin with valid data', async () => {
			const adminData = {
				id: `test-admin-${Date.now()}`,
				username: `testadmin${Date.now()}`,
				passwordHash: 'hashed_password_123',
				email: `test${Date.now()}@example.com`,
				isActive: true
			};

			const [newAdmin] = await db.insert(admin).values(adminData).returning();

			expect(newAdmin).toBeDefined();
			expect(newAdmin.id).toBe(adminData.id);
			expect(newAdmin.username).toBe(adminData.username);
			expect(newAdmin.email).toBe(adminData.email);
			expect(newAdmin.isActive).toBe(adminData.isActive);
		});

		it('should enforce unique username constraint', async () => {
			const username = `testadmin${Date.now()}`;
			const adminData1 = {
				id: `test-admin-1-${Date.now()}`,
				username,
				passwordHash: 'hashed_password_123',
				email: `test1${Date.now()}@example.com`,
				isActive: true
			};

			const adminData2 = {
				id: `test-admin-2-${Date.now()}`,
				username, // Same username
				passwordHash: 'hashed_password_456',
				email: `test2${Date.now()}@example.com`,
				isActive: true
			};

			await db.insert(admin).values(adminData1);

			// Should throw error for duplicate username
			await expect(db.insert(admin).values(adminData2)).rejects.toThrow(/unique constraint/);
		});

		it('should enforce unique email constraint', async () => {
			const email = `test${Date.now()}@example.com`;
			const adminData1 = {
				id: `test-admin-1-${Date.now()}`,
				username: `testadmin1${Date.now()}`,
				passwordHash: 'hashed_password_123',
				email,
				isActive: true
			};

			const adminData2 = {
				id: `test-admin-2-${Date.now()}`,
				username: `testadmin2${Date.now()}`,
				passwordHash: 'hashed_password_456',
				email, // Same email
				isActive: true
			};

			await db.insert(admin).values(adminData1);

			try {
				await db.insert(admin).values(adminData2);
				expect(true).toBe(false); // Should not reach here
			} catch (error) {
				console.log('Unique constraint error (admin email):', error);
				expect(error).toBeDefined();
				expect((error as Error).toString()).toMatch(
					/unique constraint|duplicate key|already exists/
				);
			}
		});
	});

	describe('Categories Table', () => {
		it('should create a category with valid data', async () => {
			const categoryData = {
				name: `Test Category ${Date.now()}`,
				slug: `test-category-${Date.now()}`,
				description: 'A test category'
			};

			const [newCategory] = await db.insert(categories).values(categoryData).returning();

			expect(newCategory).toBeDefined();
			expect(newCategory.name).toBe(categoryData.name);
			expect(newCategory.slug).toBe(categoryData.slug);
			expect(newCategory.description).toBe(categoryData.description);
		});

		it('should enforce unique name constraint', async () => {
			// Create first category with a specific name
			const name = `Test Category ${Date.now()}`;
			await db.insert(categories).values({
				name,
				slug: `test-category-${Date.now()}`,
				description: 'Test category'
			});

			// Try to create second category with the EXACT same name
			let error: Error | undefined;
			try {
				await db.insert(categories).values({
					name, // EXACT same name
					slug: `test-category-2-${Date.now()}`,
					description: 'Another test category'
				});
			} catch (e) {
				error = e as Error;
			}

			console.log('Unique constraint error:', error);
			console.log('Attempted to insert duplicate name:', name);

			// If no error was thrown, the test should fail
			if (!error) {
				throw new Error(`Expected unique constraint violation for duplicate name: ${name}`);
			}

			expect(error).toBeDefined();
			expect((error as Error).toString()).toMatch(
				/unique constraint|duplicate key|already exists/
			);
		});

		it('should verify unique constraint exists on category name', async () => {
			// This test verifies that the unique constraint actually exists
			const name = `Unique Test ${Date.now()}`;

			// First insert should succeed
			await db.insert(categories).values({
				name,
				slug: `unique-test-${Date.now()}`,
				description: 'First category'
			});

			// Second insert with same name should fail
			await expect(
				db.insert(categories).values({
					name, // Same name
					slug: `unique-test-2-${Date.now()}`,
					description: 'Second category'
				})
			).rejects.toThrow(/unique constraint|duplicate key|already exists/);
		});

		it('should enforce unique slug constraint', async () => {
			const slug = `test-category-${Date.now()}`;
			const categoryData1 = {
				name: `Test Category 1 ${Date.now()}`,
				slug,
				description: 'First category'
			};

			const categoryData2 = {
				name: `Test Category 2 ${Date.now()}`,
				slug, // Same slug
				description: 'Second category'
			};

			await db.insert(categories).values(categoryData1);

			try {
				await db.insert(categories).values(categoryData2);
				expect(true).toBe(false); // Should not reach here
			} catch (error) {
				console.log('Unique constraint error (category slug):', error);
				expect(error).toBeDefined();
				expect((error as Error).toString()).toMatch(
					/unique constraint|duplicate key|already exists/
				);
			}
		});
	});

	describe('Images Table', () => {
		it('should create an image with valid data', async () => {
			const imageData = {
				imageUrl: 'https://example.com/image.jpg',
				thumbUrl: 'https://example.com/thumb.jpg',
				filename: 'test-image.jpg',
				title: 'Test Image',
				size: 1024000
			};

			const [newImage] = await db.insert(images).values(imageData).returning();

			expect(newImage).toBeDefined();
			expect(newImage.imageUrl).toBe(imageData.imageUrl);
			expect(newImage.thumbUrl).toBe(imageData.thumbUrl);
			expect(newImage.filename).toBe(imageData.filename);
			expect(newImage.title).toBe(imageData.title);
			expect(newImage.size).toBe(imageData.size);
		});

		it('should allow nullable title and description', async () => {
			const imageData = {
				imageUrl: 'https://example.com/image.jpg',
				thumbUrl: 'https://example.com/thumb.jpg',
				filename: 'test-image.jpg',
				size: 1024000
				// title and description are null
			};

			const [newImage] = await db.insert(images).values(imageData).returning();

			expect(newImage).toBeDefined();
			expect(newImage.title).toBeNull();
			expect(newImage.description).toBeNull();
		});
	});

	describe('Products Table', () => {
		let categoryId: number;

		beforeEach(async () => {
			// Create a test category for product tests
			const [category] = await db
				.insert(categories)
				.values({
					name: `Test Category ${Date.now()}`,
					slug: `test-category-${Date.now()}`,
					description: 'A test category'
				})
				.returning();
			categoryId = category.id;
		});

		it('should create a product with valid data', async () => {
			// Create a valid category first
			const [category] = await db
				.insert(categories)
				.values({
					name: `Test Category for Product ${Date.now()}`,
					slug: `test-category-for-product-${Date.now()}`,
					description: 'Category for product test'
				})
				.returning();
			const categoryId = category.id;

			const productData = {
				title: `Test Product ${Date.now()}`,
				slug: `test-product-${Date.now()}`,
				categoryId,
				description: 'A test product',
				price: 100000, // ₹1000 in paise
				sku: `TEST-001-${Date.now()}`,
				stock: 10,
				isActive: true
			};

			const [newProduct] = await db.insert(products).values(productData).returning();

			expect(newProduct).toBeDefined();
			expect(newProduct.title).toBe(productData.title);
			expect(newProduct.slug).toBe(productData.slug);
			expect(newProduct.categoryId).toBe(productData.categoryId);
			expect(newProduct.price).toBe(productData.price);
			expect(newProduct.sku).toBe(productData.sku);
			expect(newProduct.stock).toBe(productData.stock);
			expect(newProduct.isActive).toBe(productData.isActive);
		});

		it('should enforce unique slug constraint', async () => {
			// Create a valid category first
			const [category] = await db
				.insert(categories)
				.values({
					name: `Test Category for Slug Test ${Date.now()}`,
					slug: `test-category-slug-test-${Date.now()}`,
					description: 'Category for slug test'
				})
				.returning();
			const categoryId = category.id;

			// Create first product
			const slug = `test-product-slug-${Date.now()}`;
			await db.insert(products).values({
				title: 'Test Product 1',
				slug,
				categoryId,
				description: 'A test product',
				price: 100000,
				sku: `TEST-SKU-1-${Date.now()}`,
				stock: 10,
				isActive: true
			});

			// Try to create second product with same slug
			let error: Error | undefined;
			try {
				await db.insert(products).values({
					title: 'Test Product 2',
					slug, // Same slug
					categoryId,
					description: 'Another test product',
					price: 200000,
					sku: `TEST-SKU-2-${Date.now()}`,
					stock: 20,
					isActive: true
				});
			} catch (e) {
				error = e as Error;
			}

			console.log('Unique constraint error (product slug):', error);
			expect(error).toBeDefined();
			expect((error as Error).toString()).toMatch(
				/unique constraint|duplicate key|already exists/
			);
		});

		it('should enforce unique SKU constraint', async () => {
			// Create a valid category first
			const [category] = await db
				.insert(categories)
				.values({
					name: `Test Category for SKU Test ${Date.now()}`,
					slug: `test-category-sku-test-${Date.now()}`,
					description: 'Category for SKU test'
				})
				.returning();
			const categoryId = category.id;

			// Create first product
			const sku = `TEST-SKU-${Date.now()}`;
			await db.insert(products).values({
				title: 'Test Product 1',
				slug: `test-product-1-${Date.now()}`,
				categoryId,
				description: 'A test product',
				price: 100000,
				sku,
				stock: 10,
				isActive: true
			});

			// Try to create second product with same SKU
			let error: Error | undefined;
			try {
				await db.insert(products).values({
					title: 'Test Product 2',
					slug: `test-product-2-${Date.now()}`,
					categoryId,
					description: 'Another test product',
					price: 200000,
					sku, // Same SKU
					stock: 20,
					isActive: true
				});
			} catch (e) {
				error = e as Error;
			}

			console.log('Unique constraint error (product SKU):', error);
			expect(error).toBeDefined();
			expect((error as Error).toString()).toMatch(
				/unique constraint|duplicate key|already exists/
			);
		});

		it('should enforce foreign key constraint for category', async () => {
			const productData = {
				title: `Test Product ${Date.now()}`,
				slug: `test-product-${Date.now()}`,
				categoryId: 99999, // Non-existent category ID
				price: 100000,
				sku: `TEST-001-${Date.now()}`,
				stock: 10,
				isActive: true
			};

			// Should throw error for non-existent category
			await expect(db.insert(products).values(productData)).rejects.toThrow(
				/foreign key constraint/
			);
		});

		it('should allow archiving a product', async () => {
			// Create a valid category first
			const [category] = await db
				.insert(categories)
				.values({
					name: `Test Category for Archive ${Date.now()}`,
					slug: `test-category-archive-${Date.now()}`,
					description: 'Category for archive test'
				})
				.returning();
			const categoryId = category.id;

			const productData = {
				title: `Test Product ${Date.now()}`,
				slug: `test-product-${Date.now()}`,
				categoryId,
				price: 100000,
				sku: `TEST-001-${Date.now()}`,
				stock: 10,
				isActive: true
			};

			const [product] = await db.insert(products).values(productData).returning();

			// Archive the product
			await db
				.update(products)
				.set({ archivedAt: new Date(), isActive: false })
				.where(eq(products.id, product.id));

			const archivedProduct = await db
				.select()
				.from(products)
				.where(eq(products.id, product.id))
				.then((result) => result[0]);

			expect(archivedProduct.archivedAt).toBeInstanceOf(Date);
			expect(archivedProduct.isActive).toBe(false);
		});
	});

	it('should enforce unique slug constraint for products (isolated)', async () => {
		// Create a valid category
		const [category] = await db
			.insert(categories)
			.values({
				name: `Test Category for Slug ${Date.now()}`,
				slug: `test-category-for-slug-${Date.now()}`,
				description: 'Category for slug test'
			})
			.returning();
		const categoryId = category.id;

		const slug = `test-product-slug-${Date.now()}`;
		const productData1 = {
			title: `Test Product 1 ${Date.now()}`,
			slug,
			categoryId,
			price: 100000,
			sku: `TEST-SKU-1-${Date.now()}`,
			stock: 10,
			isActive: true
		};

		const productData2 = {
			title: `Test Product 2 ${Date.now()}`,
			slug, // Same slug
			categoryId,
			price: 200000,
			sku: `TEST-SKU-2-${Date.now()}`,
			stock: 20,
			isActive: true
		};

		await db.insert(products).values(productData1);

		try {
			await db.insert(products).values(productData2);
			expect(true).toBe(false); // Should not reach here
		} catch (error) {
			console.log('Unique constraint error (product slug, isolated):', error);
			expect(error).toBeDefined();
			expect((error as Error).toString()).toMatch(
				/unique constraint|duplicate key|already exists/
			);
		}

		// Clean up
		await db.delete(products).where(eq(products.categoryId, categoryId));
		await db.delete(categories).where(eq(categories.id, categoryId));
	});

	describe('Image Tags Table', () => {
		let imageId: number;

		beforeEach(async () => {
			// Create a test image
			const [image] = await db
				.insert(images)
				.values({
					imageUrl: 'https://example.com/image.jpg',
					thumbUrl: 'https://example.com/thumb.jpg',
					filename: 'test-image.jpg',
					size: 1024000
				})
				.returning();
			imageId = image.id;
		});

		it('should create an image tag with valid data', async () => {
			const tagData = {
				imageId,
				tagName: 'test-tag'
			};

			const [newTag] = await db.insert(imageTags).values(tagData).returning();

			expect(newTag).toBeDefined();
			expect(newTag.imageId).toBe(tagData.imageId);
			expect(newTag.tagName).toBe(tagData.tagName);
		});

		it('should enforce foreign key constraint for image', async () => {
			const tagData = {
				imageId: 99999, // Non-existent image ID
				tagName: 'test-tag'
			};

			// Should throw error for non-existent image
			await expect(db.insert(imageTags).values(tagData)).rejects.toThrow(
				/foreign key constraint/
			);
		});

		it('should cascade delete when image is deleted', async () => {
			const tagData = {
				imageId,
				tagName: 'test-tag'
			};

			await db.insert(imageTags).values(tagData);

			// Delete the image
			await db.delete(images).where(eq(images.id, imageId));

			// Check that the tag was also deleted
			const remainingTags = await db
				.select()
				.from(imageTags)
				.where(eq(imageTags.imageId, imageId));

			expect(remainingTags).toHaveLength(0);
		});
	});

	describe('Product Tags Table', () => {
		let productId: number;

		beforeEach(async () => {
			// Create a test category and product
			const [category] = await db
				.insert(categories)
				.values({
					name: `Test Category ${Date.now()}`,
					slug: `test-category-${Date.now()}`,
					description: 'A test category'
				})
				.returning();

			const [product] = await db
				.insert(products)
				.values({
					title: `Test Product ${Date.now()}`,
					slug: `test-product-${Date.now()}`,
					categoryId: category.id,
					price: 100000,
					sku: `TEST-001-${Date.now()}`,
					stock: 10,
					isActive: true
				})
				.returning();
			productId = product.id;
		});

		it('should create a product tag with valid data', async () => {
			const tagData = {
				productId,
				tagName: 'test-tag'
			};

			const [newTag] = await db.insert(productTags).values(tagData).returning();

			expect(newTag).toBeDefined();
			expect(newTag.productId).toBe(tagData.productId);
			expect(newTag.tagName).toBe(tagData.tagName);
		});

		it('should enforce foreign key constraint for product', async () => {
			const tagData = {
				productId: 99999, // Non-existent product ID
				tagName: 'test-tag'
			};

			// Should throw error for non-existent product
			await expect(db.insert(productTags).values(tagData)).rejects.toThrow(
				/foreign key constraint/
			);
		});

		it('should cascade delete when product is deleted', async () => {
			const tagData = {
				productId,
				tagName: 'test-tag'
			};

			await db.insert(productTags).values(tagData);

			// Delete the product
			await db.delete(products).where(eq(products.id, productId));

			// Check that the tag was also deleted
			const remainingTags = await db
				.select()
				.from(productTags)
				.where(eq(productTags.productId, productId));

			expect(remainingTags).toHaveLength(0);
		});
	});

	describe('Product Images Table', () => {
		let productId: number;
		let imageId: number;

		beforeEach(async () => {
			// Create a test category and product
			const [category] = await db
				.insert(categories)
				.values({
					name: `Test Category ${Date.now()}`,
					slug: `test-category-${Date.now()}`,
					description: 'A test category'
				})
				.returning();

			const [product] = await db
				.insert(products)
				.values({
					title: `Test Product ${Date.now()}`,
					slug: `test-product-${Date.now()}`,
					categoryId: category.id,
					price: 100000,
					sku: `TEST-001-${Date.now()}`,
					stock: 10,
					isActive: true
				})
				.returning();

			// Create a test image
			const [image] = await db
				.insert(images)
				.values({
					imageUrl: 'https://example.com/image.jpg',
					thumbUrl: 'https://example.com/thumb.jpg',
					filename: 'test-image.jpg',
					size: 1024000
				})
				.returning();

			productId = product.id;
			imageId = image.id;
		});

		it('should create a product image with valid data', async () => {
			const productImageData = {
				productId,
				imageId,
				sortOrder: 1
			};

			const [newProductImage] = await db
				.insert(productImages)
				.values(productImageData)
				.returning();

			expect(newProductImage).toBeDefined();
			expect(newProductImage.productId).toBe(productImageData.productId);
			expect(newProductImage.imageId).toBe(productImageData.imageId);
			expect(newProductImage.sortOrder).toBe(productImageData.sortOrder);
		});

		it('should enforce foreign key constraint for product', async () => {
			const productImageData = {
				productId: 99999, // Non-existent product ID
				imageId,
				sortOrder: 1
			};

			// Should throw error for non-existent product
			await expect(db.insert(productImages).values(productImageData)).rejects.toThrow(
				/foreign key constraint/
			);
		});

		it('should enforce foreign key constraint for image', async () => {
			const productImageData = {
				productId,
				imageId: 99999, // Non-existent image ID
				sortOrder: 1
			};

			// Should throw error for non-existent image
			await expect(db.insert(productImages).values(productImageData)).rejects.toThrow(
				/foreign key constraint/
			);
		});

		it('should cascade delete when product is deleted', async () => {
			const productImageData = {
				productId,
				imageId,
				sortOrder: 1
			};

			await db.insert(productImages).values(productImageData);

			// Delete the product
			await db.delete(products).where(eq(products.id, productId));

			// Check that the product image was also deleted
			const remainingProductImages = await db
				.select()
				.from(productImages)
				.where(eq(productImages.productId, productId));

			expect(remainingProductImages).toHaveLength(0);
		});

		it('should cascade delete when image is deleted', async () => {
			const productImageData = {
				productId,
				imageId,
				sortOrder: 1
			};

			await db.insert(productImages).values(productImageData);

			// Delete the image
			await db.delete(images).where(eq(images.id, imageId));

			// Check that the product image was also deleted
			const remainingProductImages = await db
				.select()
				.from(productImages)
				.where(eq(productImages.imageId, imageId));

			expect(remainingProductImages).toHaveLength(0);
		});
	});
});

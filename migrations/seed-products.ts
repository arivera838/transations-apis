import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const TABLE_NAME = process.env['DYNAMODB_TABLE_PRODUCTS'] ?? 'Products';

const client = new DynamoDBClient({
  region: process.env['AWS_REGION'] ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const sampleProducts = [
  { name: 'Laptop Pro', price: 1200, stock: 15, category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
  { name: 'Wireless Mouse', price: 45, stock: 100, category: 'Electronics', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80' },
  { name: 'Ergonomic Chair', price: 250, stock: 30, category: 'Furniture', image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mechanical Keyboard', price: 130, stock: 50, category: 'Electronics', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80' },
  { name: 'Coffee Mug', price: 15, stock: 200, category: 'Home', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
  { name: '4K Monitor 27"', price: 380, stock: 22, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
  { name: 'Standing Desk', price: 450, stock: 12, category: 'Furniture', image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Noise Cancelling Headphones', price: 299, stock: 40, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Desk Organizer', price: 25, stock: 85, category: 'Home', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80' },
  { name: 'LED Desk Lamp', price: 60, stock: 65, category: 'Electronics', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Bookshelf Minimalist', price: 180, stock: 8, category: 'Furniture', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80' },
  { name: 'Water Bottle Stainless', price: 30, stock: 150, category: 'Home', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
  { name: 'USB-C Docking Station', price: 150, stock: 25, category: 'Electronics', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&auto=format&fit=crop&q=80' },
  { name: 'Throw Pillow Pack', price: 35, stock: 90, category: 'Home', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80' },
  { name: 'Leather Accent Armchair', price: 520, stock: 5, category: 'Furniture', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80' }
];

async function seedProducts(): Promise<void> {
  console.log(`🌱 Seeding products into table "${TABLE_NAME}"...`);

  const now = new Date().toISOString();

  const putRequests = sampleProducts.map((product) => ({
    PutRequest: {
      Item: {
        id: uuidv4(),
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: product.image,
        createdAt: now,
      },
    },
  }));

  const command = new BatchWriteCommand({
    RequestItems: {
      [TABLE_NAME]: putRequests,
    },
  });

  try {
    const result = await ddbDocClient.send(command);
    console.log(`✅ Successfully seeded ${sampleProducts.length} products!`);

    if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
      console.warn('⚠️ Some items were not processed:', result.UnprocessedItems);
    }
  } catch (error) {
    console.error('❌ Failed to seed products:', error);
  }
}

seedProducts();

import { Product } from './product.entity';

describe('Product Entity', () => {
  it('should create a valid product', () => {
    const props = {
      name: 'Test Product',
      price: 100,
      stock: 10,
      category: 'Electronics',
      image: 'http://example.com/image.png',
    };

    const product = Product.create(props);

    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
    expect(product.name).toBe(props.name);
    expect(product.price).toBe(props.price);
    expect(product.stock).toBe(props.stock);
    expect(product.category).toBe(props.category);
    expect(product.image).toBe(props.image);
    expect(product.createdAt).toBeDefined();
  });

  it('should format to primitives', () => {
    const product = Product.fromPersistence({
      id: '123',
      name: 'Persistent Product',
      price: 50,
      stock: 5,
      category: 'Home',
      image: 'img.png',
      createdAt: '2021-01-01T00:00:00.000Z',
    });

    const primitives = product.toPrimitives();

    expect(primitives).toEqual({
      id: '123',
      name: 'Persistent Product',
      price: 50,
      stock: 5,
      category: 'Home',
      image: 'img.png',
      createdAt: '2021-01-01T00:00:00.000Z',
    });
  });

  it('should throw error on negative price', () => {
    expect(() => {
      Product.create({
        name: 'Bad Price',
        price: -10,
        stock: 5,
        category: 'Test',
      });
    }).toThrow('Price cannot be negative');
  });

  it('should throw error on negative stock', () => {
    expect(() => {
      Product.create({
        name: 'Bad Stock',
        price: 10,
        stock: -5,
        category: 'Test',
      });
    }).toThrow('Stock cannot be negative');
  });
});

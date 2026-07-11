import { v4 as uuidv4 } from 'uuid';

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly category: string,
    public readonly image: string,
    public readonly createdAt: string,
  ) {}

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      stock: this.stock,
      category: this.category,
      image: this.image,
      createdAt: this.createdAt,
    };
  }

  static create(props: {
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
  }): Product {
    if (props.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (props.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const now = new Date().toISOString();

    return new Product(
      uuidv4(),
      props.name,
      props.price,
      props.stock,
      props.category,
      props.image ?? '',
      now,
    );
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    createdAt: string;
  }): Product {
    return new Product(
      props.id,
      props.name,
      props.price,
      props.stock,
      props.category,
      props.image ?? '',
      props.createdAt,
    );
  }
}

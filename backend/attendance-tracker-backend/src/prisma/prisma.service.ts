// 1. MUST BE THE VERY FIRST LINE
import 'dotenv/config'; 

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';

// ✅ Use the new alias you just created
// import { PrismaClient, Prisma } from 'generated/prisma/client'; // Relative to src/prisma/
// import { PrismaClient } from '../generated/prisma/index.js'; // Note the .js at the end

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 2. Explicitly cast to string and check if it exists
    const connectionString = `${process.env.DATABASE_URL}`;
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in your .env file");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    // 3. Pass the adapter to Prisma 7
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
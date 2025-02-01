import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Model } from 'mongoose';
import { User } from '../src/users/entities/user.entity';
import { ShortenedUrl } from '../src/url-shortener/entities/url-shortener.entity';
import { getModelToken } from '@nestjs/mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let urlModel: Model<ShortenedUrl>;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    urlModel = moduleFixture.get<Model<ShortenedUrl>>(
      getModelToken(ShortenedUrl.name),
    );

    await userModel.deleteMany({}).exec();
    await urlModel.deleteMany({}).exec();
  });

  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.email).toBe('test@test.com');
  });

  it('should login and get JWT token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123',
      })
      .expect(201);

    jwtToken = response.body.token;
    expect(jwtToken).toBeDefined();

    console.log('Login response:', response.body);
  });

  describe('URL Shortener (e2e)', () => {
    let shortCode: string;

    it('should create shortened URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/api')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          originalUrl: 'https://example.com',
        })
        .expect(201);

      shortCode = response.body.shortCode;
      expect(shortCode).toBeDefined();
    });

    it("should get user's URLs", async () => {
      await request(app.getHttpServer())
        .get('/api')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should redirect to original URL', async () => {
      const url = await urlModel.findOne({ shortCode }).exec();

      if (url) {
        await request(app.getHttpServer())
          .get(`/api/${shortCode}`)
          .expect(302)
          .expect('Location', 'https://example.com');
      } else {
        console.error('No URL found with shortCode:', shortCode);
      }
    });
  });

  afterAll(async () => {
    await userModel.deleteMany({}).exec();
    await urlModel.deleteMany({}).exec();
    await app.close();
  });
});

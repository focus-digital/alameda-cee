import type { FastifyInstance } from "fastify"
import { createTestApp } from "../helpers/test-app.js";
import { beforeAll, describe, expect, it } from "vitest";

describe('Health routes', () => {
  let app: FastifyInstance
  
  beforeAll(async () => {
    app = (await createTestApp()).app;
  })
  
  describe('GET /health', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })
      
      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ status: "ok" })
    })
  })
})
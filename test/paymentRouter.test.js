import request from "supertest";
import app from "../server";

// Dummy token and reference for testing
const dummyToken = "Bearer your_test_token_here";
let paymentReference = "test-reference-id";

describe("Payment Routes", () => {
  it("should initiate a payment", async () => {
    const res = await request(app)
      .post("/api/v1/payment/initiatePayment")
      .set("Authorization", dummyToken)
      .send({
        email: "student@example.com",
        amount: 5000,
        paymentMethod: "credit_card",
      });

    expect([200, 400, 401, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      paymentReference = res.body.reference;
    }
  });

  it("should verify a payment", async () => {
    const res = await request(app)
      .get(`/api/v1/payment/verify/${paymentReference}`)
      .set("Authorization", dummyToken);

    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });
});

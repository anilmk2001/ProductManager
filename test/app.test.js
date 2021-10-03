const app = require("../src/app.js");
const supertest = require("supertest");
const axios = require("axios");
jest.mock("axios");
const BACKEND_URL = "https://www.mocky.io/v2/5e307edf3200005d00858b49";

const mockDBResult = {
  data: {
    products: [
      {
        title: "Test Trouser 1",
        price: 10,
        sizes: ["small", "medium", "large"],
        description: "This trouser perfectly pairs with a green shirt.",
      },
      {
        title: "Test Trouser 2",
        price: 11,
        sizes: ["small"],
        description: "This trouser perfectly pairs with a blue shirt.",
      },
    ],
  },
};

const mockAPIResponse = {"content":[{"title":"Test Trouser 1","price":10,"sizes":["small","medium","large"],"description":"This trouser perfectly pairs with a <em>green</em> shirt."}],"filter":{"price":{"min":10,"max":10},"sizes":["small"],"frequentWords":["a","green","shirt"]}};

test("Get api call is executed successfully", async () => {
  axios.get.mockResolvedValueOnce(mockDBResult);
  const response = await supertest(app).get("/getProductDetail?maxprice=15&size=medium&highlight=green,blue");
  expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}`);
  expect(JSON.parse(response.text)).toEqual(mockAPIResponse);
});

/*
test("Get api call throws error in case of any exception", async () => {
    try{
    axios.get = jest.fn(()=>{
        throw new Error('Unexpected error');
    })
    const response = await supertest(app).get("/getProductDetail");
    expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}`);
    }
    catch(err){
        expect(err).toBeTruthy();
    }
  });
*/

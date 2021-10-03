const express = require("express");
const app = express();
const axios = require("axios");
const MODULE_NAME = "ProductManager";
const BACKEND_URL = "https://www.mocky.io/v2/5e307edf3200005d00858b49";

/**
 * Handler method for GET api '/getProductDetail'
 * If filter parameters are provided, result will be filtered
 * If highlighter is provided, those will be highlighted
 */
app.get("/getProductDetail", async (req, res) => {
  try{
  const maxPrice = req.query.maxprice;
  const size = req.query.size;
  const highlight = req.query.highlight;
  console.log(
    `${MODULE_NAME} getProductDetail : Query parameters are maxPrice=${maxPrice}, size=${size}, highlight=${highlight}`
  );
  //Backend call to get product details
  axios
    .get(BACKEND_URL)
    .then((response) => {
      console.log(
        `${MODULE_NAME} getProductDetail : Response data received from DB is ${JSON.stringify(
          response.data
        )}`
      );

      //Throw error if invalid response object received
      if (!response.data || !response.data.products) {
        throw new Error(
          `${MODULE_NAME} getProductDetail : Error - Invalid response data received`
        );
      }

      let productsList = response.data.products;
      //Filter results if any of the filter params are provided
      if (maxPrice || size) {
        productsList = filterProducts(productsList, maxPrice, size);
      }
      //Return formatted result
      res.json(formatResult(productsList, highlight));
    })
    //Throw error if any exception occurred with backnen call
    .catch((err) => {
      throw new Error(
        `${MODULE_NAME} getProductDetail : Fetching product details from backend failed with error - `,
        err
      );
    });}
    catch (err) {
      throw new Error(
        `${MODULE_NAME} getProductDetail : api invocation failed with error - `,
        err
      );
    }
});

/**
 * This method handles filtering of products list based on maxPrice or size provided in request.
 * If none is provided, entire list will be returned
 */
const filterProducts = (products, maxPrice, size) => {
  try {
    let filteredProducts = products;
    //Product will be included if size provided(exm:medium) is included in product sizes
    if (size) {
      filteredProducts = filteredProducts.filter((product) => {
        return product.sizes.includes(size);
      });
    }
    //Product will be included if product price is <= maxPrice provided
    if (maxPrice) {
      filteredProducts = filteredProducts.filter((product) => {
        return product.price <= maxPrice;
      });
    }
    console.log(
      `${MODULE_NAME} filterProducts : Filtered product list is ${JSON.stringify(
        filteredProducts
      )}`
    );
    return filteredProducts;
  } catch (err) {
    throw new Error(
      `${MODULE_NAME} filterProducts : Filtering product details failed with error - `,
      error
    );
  }
};

/**
 * This method handles formatting of response data
 * Contains two sections:
 * 1) content - contains filtered product list
 * 2) filter - contains filter details
 */
const formatResult = (products, highlight) => {
  try {
    //Get filter details to be set in response object
    const filterDetails = getFilterDetails(products);
    console.log(
      `${MODULE_NAME} formatResult : filterDetails which will be set in response is ${JSON.stringify(filterDetails)}`
    );
    //If highlighter is provided, highlight those words in description string
    if (highlight) {
      products = highlightString(products, highlight);
    }
    return { content: products, filter: filterDetails };
  } catch (err) {
    throw new Error(
      `${MODULE_NAME} formatResult : Formating response failed with error - `, error
    );
  }
};

/**
 * This method prepares filter details object
 * Contains three sections:
 * 1) price - min and max price of filtered products
 * 2) sizes - all sizes of filtered products
 * 3) frequentWords - most occurred words in description section (other than top 5 words)
 */
const getFilterDetails = (products) => {
  let filter = {};
  let sizes = new Set();
  let prices = new Set();
  let wordCountMap = new Map();
  try {
    //Iterating product list to get details of sizes, prices, wordcount in description, from filtered product list
    products.map((product) => {
      product.sizes.forEach(size => sizes.add(size));
      prices.add(product.price);
      let description = product.description;
      //Avoiding dot from description string, if it's the last character
      if (description.substr(-1) === ".") {
        description = description.substring(0, description.length - 1);
      }
      let words = description.split(" ");
      //Incrementing count detail of each word in wordCountMap
      words.forEach((word) => {
        if (wordCountMap.has(word)) {
          wordCountMap.set(word, wordCountMap.get(word) + 1);
        } else {
          wordCountMap.set(word, 1);
        }
      });
    });

    //Set required fields in filter object
    filter.price = { min: Math.min(...prices), max: Math.max(...prices) };
    filter.sizes = [...sizes];
    filter.frequentWords = getMostOccurrentWords(wordCountMap);
    return filter;
  } catch (err) {
    throw new Error(
      `${MODULE_NAME} getFilterDetails : Creating filter object failed with error - `, error
    );
  }
};

/**
 * This method returns an array with most occurrent words in description section of all products in filtered products list
 * Note - Top five words will be avoided, as it can be generic like 'This', 'is' etc.
 */
const getMostOccurrentWords = (wordCountMap) => {
  //Declaring result array, with defined size of 10
  let mostOccurrentWords = new Array(10);
  //Temp array for processing purpose
  let wordCountArray = [];
  try {
    //Get a sorted map(desending - based on count value) to identify which words have more occurrence
    const wordCountMapSorted = new Map(
      [...wordCountMap.entries()].sort((a, b) => b[1] - a[1])
    );

    //Adding all keys(words) from wordCountMapSorted to wordCountArray
    for (let [key] of wordCountMapSorted) {
      wordCountArray.push(key);
    }
    //Setting mostOccurrentWords, after avoiding first 5 more occurrent words.
    //If total words are less than 5, none will be considered
    let wordCountArraySize = wordCountArray.length;
    if (wordCountArraySize <= 5) {
      mostOccurrentWords = [];
    } else {
      const WORD_EXLCUDE_LIMIT = 5;
      for (let i = 5; i < wordCountArraySize; i++) {
        mostOccurrentWords[i - WORD_EXLCUDE_LIMIT] = wordCountArray[i];
      }
    }
    //Avoiding null values from result array. This can be avoided if array without predefined size is used
    return mostOccurrentWords.filter((word) => word != null);
  } catch (err) {
    throw new Error(
      `${MODULE_NAME} getMostOccurrentWords : Identifying most occurrent words failed with error - `, error
    );
  }
};

/**
 * This method handles highlighting the words provided in request query params
 * Contains two sections 1) content, which contains filtered product list 2) filter, which contains filter details
 */
const highlightString = (products, highlight) => {
  try {
    let highLighterTrimmed;
    //Adding the values to array, as 'highlight' variable can contain comma separated values
    let highlighters = highlight.split(",");

    //Iterate through product list to highlight words in description
    products = products.map((product) => {
      //Checking for all highlight words
      highlighters.forEach((highlighter) => {
        highLighterTrimmed = highlighter.trim();
        product.description = product.description.replace(
          new RegExp(highLighterTrimmed, `g`),
          `<em>${highLighterTrimmed}</em>`
        );
      });
      return product;
    });
    return products;
  } catch (err) {
    throw new Error(
      `${MODULE_NAME} highlightString : Highlighting words failed with error - `, error
    );
  }
};

module.exports = app;

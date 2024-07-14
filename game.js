/*
 * Name: Woo Sik Choi & Adeel Sultan
 * Date: 12/22/2023
 * Description: Game logic / functionality with GPT
 * Known Bugs : Some OpenAI API models malfunction, so it might not create and grab "proper" AI responses. I found out after I debugged for five hours and learned that it was not because of our codes   
 */

const LLMKey = process.env['GPTAPIKey'];
// If there is anything going wrong with connection, change it to positive
const NUM_RETRIES = 5;

async function LLMTest(question) {
  try {
    const LLMres = await generateResponse(question);
    if (
      !LLMres ||
      typeof LLMres !== 'object' ||
      !LLMres.choices ||
      !LLMres.choices[0] ||
      !LLMres.choices[0].text
    ) {
      console.error('Invalid response structure from generateResponse');
      return null;
    }

    console.log('LLMres.choices[0] value:');
    console.log(LLMres);
    console.log(LLMres.choices[0]);
    return LLMres.choices[0].text.trim();
  } catch (error) {
    console.error('Error in LLMTest :', error);
    return null;
  }
}
//looking for free API access, might need to buy credit
async function generateResponse(prompt, retries = NUM_RETRIES, delay = 1000) {
  const endpoint = 'https://api.openai.com/v1/engines/davinci/completions';
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLMKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 15,
      temperature: 0.1, // Adjust temperature if necessary
    }),
  };

  try {
    const response = await fetch(endpoint, requestOptions);
    if (!response.ok) {
      console.error(
        `Request failed with status: ${response.status}, ${response.statusText}`,
      );
      const errorBody = await response.text();
      console.error(`Error details: ${errorBody}`);
      return null;
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error fetching from OpenAI API:', error);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateResponse(prompt, retries - 1, (delay *= 2));
    }
    return null;
  }
}

module.exports = {
  generateResponse,
  LLMTest,
};

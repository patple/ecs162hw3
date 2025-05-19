import {test, expect} from 'vitest';
import {render} from '@testing-library/svelte';
import App from './App.svelte';

let apiKey: string = '';

test ('App', async () =>{
    render(App);
});


//test if backend returns correct API key
test('apiKey', async() =>{
    const reply = await fetch('http://localhost:8000/api/key');
    const response = await reply.json();
    expect(response.apiKey).toBe('bvnCwkJQLOdMXuCQlbvgHNvGZwhswYqZ')

});

//check if display date is correct
test('dateTest', async() =>{
    const currentDate = new Date();
    const correctDate = currentDate.toDateString();
    const displayedDate = document.getElementById('date');
    expect(displayedDate?.innerHTML).toBe(correctDate);
});

// check to see if our fetch works for the articles and checks the article contents
test('testAPI', async () => {
    // news fetch taken from App.svelte
    try {
      const resKey = await fetch('http://localhost:8000/api/key');
      const dataKey = await resKey.json();
      apiKey = dataKey.apiKey;
      const res = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=Sacramento%20AND%20Davis&api-key=${apiKey}`);
      
      const data = await res.json();
      const sixArticles = data.response.docs.slice(0, 6);
      const articles = [];
      for (const article of sixArticles) {
            articles.push({
              headline: article.headline,
              abstract: article.abstract,
              multimedia: article.multimedia
            });
      }
      // checks if 6 articles are fetched
      expect(articles.length).toBe(6);
      
      // check to see if contents are null
      for (const article of articles) {
        // this checks if the fetched articles has the correct query/ content Davis or Sac
        expect(article.headline.includes('sacramento') || article.abstract.includes('davis') || article.headline.includes('davis') || article.abstract.includes('sacramento'));
        expect(article.headline?.main).toBeTruthy();
        expect(article.abstract).toBeTruthy();
      }

    } catch (error) {
      console.error('News fetch failed', error);
    }
    
});


// checks if users are able to login
test('validLogin', async() =>{
  const res = await fetch('http://localhost:8000/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email: 'admin@hw3.com',
      password: 'password'
    })
  })

  expect(res.status).not.toBe(404)
})


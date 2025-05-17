<script lang="ts">
  import { onMount } from 'svelte';
  let apiKey: string = '';
  let articles: any[] = [];

  onMount(async () => {
    try {
      const resKey = await fetch('http://localhost:8000/api/key');
      const dataKey = await resKey.json();
      apiKey = dataKey.apiKey
      const res = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=Sacramento%20AND%20Davis&api-key=${apiKey}`
      //https://api.nytimes.com/svc/search/v2/articlesearch.json?q="Davis,california"ORsacramento&api-key=
);
      const data = await res.json();
      let sixArticles = data.response.docs.slice(0, 6);
      articles = [];
      for (const article of sixArticles) {
        articles.push({
          headline: article.headline,
          abstract: article.abstract,
          multimedia: article.multimedia
        });
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error);
    }
    
  });

  function openSidebar(): void{
    const sidebar = document.getElementById("sideBarDisplay");
    if (sidebar){
      sidebar.style.width = "100%"
    }
  }

  function closeSidebar(): void{
    const sidebar = document.getElementById("sideBarDisplay");
    if (sidebar){
      sidebar.style.width = "0%"
    }
  }

</script>


<div id= "sideBarDisplay" class ="overLay">
  <button class= "exitSidebar" on:click={closeSidebar}>X</button>
  <div class ="sidebar-comments">
    <p>Comments</p>
  </div>
</div>

<main>

  <header>


    <p class="Language">
        U.S.    International    Canada    Español    中文 <!--Language implementation.-->
    </p>
    <div class="button_container">
    <button class="button"><strong>SUBSCRIBE FOR $1/WEEK</strong></button> <!--Button implementation.-->

   
    <button class="button" on:click={() => window.location.href = 'http://127.0.0.1:8000/'}><strong>LOG IN</strong></button>
    </div>

    <!--Using flex box to implement the information in the header.-->
    <div style="
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    ">
    <div>
        <p id="date" style="font-family: Arial, Helvetica, sans-serif;"></p>
        <script>    // Gets current date
            const date = new Date();
            document.getElementById("date").innerHTML = date.toDateString();
        </script>
    </div>
    <div>
        SMP
    </div>
    </div>
    <div style="text-align: center;">
      <img class="img" alt="New York Times Logo" src="https://d24wuq6o951i2g.cloudfront.net/img/events/id/290/2900492/assets/2a9.f63.NYT-large-black-clear-background.png"  style="max-width: 100%; height: auto">
    </div>
</header>

  <hr class="lines">
  <hr class="lines">


  <div class="grid">
    {#each articles as article}
      <div class="grid-item">
        {#if article.multimedia.default.url}
          <div class="image-container">
            <img 
              src={article.multimedia.default.url}
              alt={article.headline.main}
              style="max-width: 100%; height: auto;"
            />
          </div>
        {/if}
        <h1>{article.headline.main}</h1>
        <p>{article.abstract}</p>
        <button on:click={openSidebar}><strong>Comment</strong></button>
      </div>
    {/each}
    
  </div>

  <footer>
    <p class="footer">@2025 The New York Times Company</p>
  </footer>
</main>
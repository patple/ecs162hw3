<script lang="ts">
  import { onMount } from 'svelte';
  let apiKey: string = '';
  let articles: any[] = [];
  let commentInput: string = '';
  let currentIndex: number = -1;
  let articleComments: {[key: number]: string[]} = {};
  let user: {email:string; role:string; username: string} | null = null;

 async function fetchUser(){
  try{
    const res = await fetch('http://localhost:8000/api/user', {credentials:'include'})
    if(res.ok){
      user = await res.json();
    }else{
      user = null;
    }
  }catch(error){
    user = null;
  }
 }

 async function logout(){
   try{
    const res = await fetch('http://localhost:8000/logout', {method:'GET', credentials:'include'})
    if(res.ok){
      window.location.href ='/'
    }else{
      console.error('Failed logout')
    }
  }catch(error){
    console.error('Failed logout', error)
  }
 }

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
      for (let i = 0; i < articles.length; i++) {
        articleComments[i] = [];
      }

    } catch (error) {
      console.error('Failed to fetch API key:', error);
    }
    await fetchUser();
  });

  function openSidebar(index: number): void {
    currentIndex = index;
    const sidebar = document.getElementById("sideBarDisplay");
    if (sidebar) {
      sidebar.style.width = "30%";
    }
  }

  function closeSidebar(): void {
    const sidebar = document.getElementById("sideBarDisplay");
    if (sidebar) {
      sidebar.style.width = "0%";
    }
    currentIndex = -1;
    commentInput = '';
  }

  function submitComment(): void {
    if (commentInput.trim() !== '' && currentIndex >= 0) {
      if (!articleComments[currentIndex]) {
        articleComments[currentIndex] = [];
      }
    const oldComments = articleComments[currentIndex];
    const newComments = oldComments.slice(); 
    newComments.push(commentInput.trim());
    articleComments[currentIndex] = newComments;      
    commentInput = '';
    }
    
  }

</script>
<div id="sideBarDisplay" class="overLay">
  <button class="exitSidebar" on:click={closeSidebar}>X</button>
  
  <div class="sidebar-comments">
    <div class="Comment-bar">
      <h1 class="title-font">{#if currentIndex >= 0 && articles[currentIndex] && articles[currentIndex].headline}"{articles[currentIndex].headline.main}"{/if}</h1>

      {#if currentIndex >= 0}
        {#if user}
          <form on:submit|preventDefault={submitComment}>
            <input 
              type="text" 
              placeholder="Share your thoughts." 
              name="comment" 
              bind:value={commentInput} 
            />
            <div>
              <button type="button" class="button" on:click={() => commentInput = ''}>Cancel</button>
              <button type="submit" class="button" aria-label="submit comment">Submit</button>
            </div>
          </form>
        {:else}
            <p>LOG IN</p>
        {/if}
          {#if articleComments[currentIndex] && articleComments[currentIndex].length > 0}
            <ul>
              {#each articleComments[currentIndex] as comment}
                <li>{comment}</li>
              {/each}
            </ul>
          {/if}
      {/if}
    </div>
  </div>
</div>

<main>
  <header>
    <p class="Language">
        U.S.    International    Canada    Español    中文 <!--Language implementation.-->
    </p>
    <div class="button_container">
      <button class="button"><strong>SUBSCRIBE FOR $1/WEEK</strong></button> <!--Button implementation.-->
      {#if user}
        <button class="button" on:click={logout}><strong>LOG OUT</strong></button>
      {:else}
        <button class="button" on:click={() => window.location.href = 'http://localhost:8000/login'}><strong>LOG IN</strong></button>
      {/if}
      
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
    {#each articles as article, index}
      <div class="grid-item">
        {#if article.multimedia.default.url}
          <div class="images">
            <img 
              src={article.multimedia.default.url}
              alt={article.headline.main}
              style="max-width: 100%; height: auto;"
            />
          </div>
        {/if}
        <h1>{article.headline.main}</h1>
        <p>{article.abstract}</p>
        <button class="button" on:click={() => openSidebar(index)}>
          <strong>Comment {#if articleComments[index] && articleComments[index].length > 0}({articleComments[index].length}){/if}</strong>
        </button>
      </div>
    {/each}
  </div>

  <footer>
    <p class="footer">@2025 The New York Times Company</p>
  </footer>
</main>
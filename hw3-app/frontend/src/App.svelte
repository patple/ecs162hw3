<script lang="ts">
  import { onMount } from 'svelte';
  let apiKey: string = '';
  let articles: any[] = [];
  let commentInput: string = '';
  let currentIndex: number = -1;
  let articleComments: {[key: number]: string[]} = {};
  let user: {email:string; role:string; username: string} | null = null;

  const staticComments = [
    "HELLO CHAT",
    "I HECKING LOVE READING THE NEWS ABOUT DAVIS ITS MY FAVORITE",
    "HOW DO YOU TURN OFF CAPS LOCK?",
    "This is all fake news",
    "Chat is this news real??",
    "Very interesting thanks for the updates"
  ]

  const staticReplies = [
    "WASSUP DAWG",
    "ME TOO MAN WE SHOULD HANG OUT",
    "It's on the left of your keyboard under tab.",
    "Nuh Uh",
    "This generation is cooked.",
    "Yeah this local news is good."
  ]

//gets user info to tell users appart 
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
  
  interface Reply{
    text: string;
    replies: Reply[];
  }
  let replyComment: string = '';
  let currentReply: {articleIndex: number, commentIndex: number} | null = null;
  let articleReplies: {[articleIndex: number]: {[commentIndex: number]: Reply[]}} = {}

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
        articleComments[i] = [staticComments[i]];
        articleReplies[i] = { 0: [{text: staticReplies[i], replies:[]}]}
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
    replyComment = '';
    currentReply = null;
  }
  //creates new comments 
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
  // creates new reply to comments
  function submitReply(): void {
    if (replyComment.trim() !== '' && currentReply) {
      const { articleIndex, commentIndex } = currentReply;
      if (!articleReplies[articleIndex]) {
        articleReplies[articleIndex] = {};
      }
      
      if (!articleReplies[articleIndex][commentIndex]) {
        articleReplies[articleIndex][commentIndex] = [];
      }
      
      const oldReplies = articleReplies[articleIndex][commentIndex];
      const newReplies = oldReplies.slice(); 
      newReplies.push({text: replyComment.trim(), replies: []})
      articleReplies[articleIndex][commentIndex] = newReplies;
      
      replyComment = '';
      currentReply = null;
    }
  }
  
  // toggle to hide or show the reply input for a comment
  function toggleReply(commentIndex: number): void {
    if (currentReply && 
        currentReply.articleIndex === currentIndex && 
        currentReply.commentIndex === commentIndex) {
      currentReply = null;
    } else {
      currentReply = {
        articleIndex: currentIndex,
        commentIndex: commentIndex
      };
      replyComment = '';
    }
  }

  // deletes comments
function deleteComment(commentIndex: number): void {
  if (currentIndex < 0 || !articleComments[currentIndex]) {
    return;
  }
  const comments = articleComments[currentIndex];
  const newComments: string[] = [];

  // pushes all comments besides the deleted one 
  for (let i = 0; i < comments.length; i++) {
    if (i !== commentIndex) {
      newComments.push(comments[i]);
    }
  }

  articleComments[currentIndex] = newComments;
  if (articleReplies[currentIndex] && articleReplies[currentIndex][commentIndex]) {
    delete articleReplies[currentIndex][commentIndex];
  }

  //deleted the replies in that comment
  if (articleReplies[currentIndex]) {
    const oldReplies = articleReplies[currentIndex];
    const newReplies: { [key: number]: Reply[] } = {};
    for (let key in oldReplies) {
      const replyIndex = parseInt(key);
      const replies = oldReplies[replyIndex];
      if (replyIndex < commentIndex) {
        newReplies[replyIndex] = replies;
      } else if (replyIndex > commentIndex) {
        newReplies[replyIndex - 1] = replies;
      }
    }

    articleReplies[currentIndex] = newReplies;
  }
  if (currentReply &&
      currentReply.articleIndex === currentIndex &&
      currentReply.commentIndex === commentIndex) {
    currentReply = null;
    replyComment = '';
  }
}

//deletes replies for a comment when the comment is deleted 
function deleteReply(commentIndex: number, replyIndex: number): void {
  if (currentIndex < 0 || !articleReplies[currentIndex] || !articleReplies[currentIndex][commentIndex]
  ) {
    return;
  }
  const replies = articleReplies[currentIndex][commentIndex];
  const newReplies: Reply[] = [];
  for (let i = 0; i < replies.length; i++) {
    if (i !== replyIndex) {
      newReplies.push(replies[i]);
    }
  }
  articleReplies[currentIndex][commentIndex] = newReplies;
}
</script>



<!--The logic for the sidebar,comments, replies and user auth-->
<!--User must be logged in to comment and mods are the only one that can delete comments-->
<div id="sideBarDisplay" class="overLay">
  <button class="exitSidebar" on:click={closeSidebar}>X</button>
  
  <div class="sidebar-comments">
    <div class="Comment-bar">
      <h1 class="title-font">{#if currentIndex >= 0 && articles[currentIndex] && articles[currentIndex].headline}'{articles[currentIndex].headline.main}'{/if}</h1>

      {#if currentIndex >= 0}
        <!-- checks if user is logged in-->
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
          <!-- if not they are redirected to login-->
        {:else}
            <script>
              window.location.href = 'http://localhost:8000/login'
            </script>
          {/if}
        {/if}
        <!--if there are already comments allows the user to see the reply button-->
        {#if articleComments[currentIndex] && articleComments[currentIndex].length > 0}
          <ul>
            {#each articleComments[currentIndex] as comment, commentIndex}
              <li>
                {comment}
                  <button class="reply-button" on:click={() => toggleReply(commentIndex)}>
                    Reply
                  </button>
                  <!--checks if the user role is mod if so they can delete-->
                  {#if user && user.role == 'moderator'}
                    <button class="delete-button" on:click={() => deleteComment(commentIndex)}>
                      Delete
                    </button>
                  {/if}
              </li>
              <hr>
              <!--displays the reply textbox if there is a comment to reply to and if the user presses the reply button-->
              {#if currentReply && currentReply.articleIndex === currentIndex && currentReply.commentIndex === commentIndex}
                <form on:submit|preventDefault={() => submitReply()}>
                  <input 
                    type="text" 
                    placeholder="Replying to User..." 
                    bind:value={replyComment}
                  />
                  <button type="submit" class="button" aria-label="submit reply">Submit</button>
                </form>
              {/if}
              <!--allows for replies under replies-->
              {#if articleReplies[currentIndex] && 
                  articleReplies[currentIndex][commentIndex] && 
                  articleReplies[currentIndex][commentIndex].length > 0}
                <ul class="reply">
                  {#each articleReplies[currentIndex][commentIndex] as reply, replyIndex}
                    <li>
                      {reply.text}
                      <button class="reply-button" on:click={() => toggleReply(commentIndex)}>
                      Reply
                      </button>
                      <!--checks if the user role is mod if so they can delete-->
                      {#if user && user.role == 'moderator'}
                        <button class="delete-button" on:click={() => deleteReply(commentIndex, replyIndex)}>
                          Delete
                        </button>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            {/each}
          </ul>
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
      <!-- if user is logged in the logout button is visible-->
      {#if user}
        <button class="button" on:click={logout}><strong>LOG OUT</strong></button>
      {:else}
      <!-- if not they can login and redirceted to dex login-->
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
        <p id="date" class="date-format"></p>
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
        {#if article.multimedia && article.multimedia.default && article.multimedia.default.url}
          <div class="images">
            <img 
              src={article.multimedia.default.url}
              alt={article.headline.main}
              style="max-width: 100%; height: auto;"
            />
          </div>
        {/if}
        <h1 class="title-font">{article.headline.main}</h1>
        <p>{article.abstract}</p>
        <button class="button" on:click={() => openSidebar(index)}>
          <!--comment button for each article-->
          <strong>Comment {#if articleComments[index] && articleComments[index].length > 0}({articleComments[index].length}){/if}</strong>
        </button>
      </div>
    {/each}
  </div>

  <footer>
    <p class="footer">@2025 The New York Times Company</p>
  </footer>
</main>


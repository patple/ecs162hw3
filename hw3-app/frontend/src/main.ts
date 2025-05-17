import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app

const todayDate: Date = new Date();
const elements: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };

const currentDateElement = document.getElementById("current-date");
if (currentDateElement) {
    currentDateElement.innerHTML = todayDate.toLocaleDateString('en-US', elements);
}
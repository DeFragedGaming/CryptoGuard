import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Posts from './components/Posts';
import About from './components/About';


function App() {
  return (
    <Router>
      <header>
        <h1>Welcome to Your App</h1>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/posts">Posts</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <Routes>
          <Route exact path="/" component={Home} />
          <Route path="/posts" component={Posts} />
          <Route path="/about" component={About} />
        </Routes>
      </main>

      <footer>
        &copy; 2023 Your App. All rights reserved.
      </footer>
    </Router>
  );
}

export default App;
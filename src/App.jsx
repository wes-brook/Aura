import { useState, useEffect } from 'react';
import axios from 'axios';
import { Analytics } from "@vercel/analytics/react";

const API_URL = "/api/quotes";

const Header = props => <h1>{props.heading}</h1>;

const Button = props => <button onClick={props.onClick}>{props.text}</button>;

const Display = props => {
  return (
    <>
      <p>{props.content}</p>
      <p>has {props.likes} likes {props.likes > 0 ? '👍' : ''}</p>
    </>
  );
};

const TopQuote = props => {
  if (props.quotes.every(quote => quote.likes === 0) || (!props.quotes.length)) {
    return (
      <>
        <p>nothing liked so far</p>
      </>
    );
  }

  const topLikedQuotes = props.quotes
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)

  return (
    <>
      {topLikedQuotes.map((quote, index) => (
        <div key={quote._id} className="flex items-start space-x-2">
          <span className="text-lg font-bold">{index + 1}.</span>
          <Display content={quote.content} likes={quote.likes} />
        </div>
      ))}
    </>
  );
};

const App = () => {
  const [quotes, setQuotes] = useState([]);
  const [selected, setSelected] = useState(0);
  const [newQuote, setNewQuote] = useState("");

  useEffect(() => {
    fetchQuotes();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchQuotes();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start polling when the component mounts
    startPolling();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await axios.get(API_URL)
      setQuotes(response.data)
    } catch (error) {
      console.error("Error fetching quotes: ", error)
    }
  }

  const startPolling = () => {
    fetchQuotes();
    window.pollingInterval = setInterval(() => {
      fetchQuotes();
    }, 5000); // Poll every 5 seconds
  };

  const stopPolling = () => {
    clearInterval(window.pollingInterval);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newQuote.trim() === "") return

    try {
      await axios.post(API_URL, {content: newQuote}) // Send the new quote to our custom backend API
      setNewQuote("") // Reset newQuote
      fetchQuotes()
    } catch (error) {
      console.log("Error adding quote: ", error)
    }
  }

  const randomSelection = () => {
    stopPolling()
    let randomInt
    do {
      randomInt = Math.floor(Math.random() * quotes.length)
    } while (randomInt === selected)
    setSelected(randomInt)
  }

  const castLike = async (id) => {
    try {
      await axios.patch(`${API_URL}?id=${id}`);  // Query parameter format
      fetchQuotes();
    } catch (error) {
      console.error("Error liking quotes: ", error);
    }
  }
  

  return (
    <div>
      <div className="flex justify-left mb-4">
        <img src="/favicon.ico" alt="Logo" className="h-16 w-16" />
      </div>
      <Header heading="Quote of the day" />
      {quotes.length > 0 && (
        <Display content={quotes[selected].content} likes={quotes[selected].likes} />
      )}
      {quotes.length > 0 && (
        <Button onClick={() => castLike(quotes[selected]._id)} text="like" />
      )}
      <Button onClick={randomSelection} text="next quote" />
      <Header heading="Quote with the most likes" />
      <TopQuote quotes={quotes} />
      <form onSubmit={handleSubmit}>
        <textarea
          value={newQuote}
          onChange={(e) => setNewQuote(e.target.value)}
          placeholder="Enter your quote"
        />
        <button type="submit">Submit quote</button>
      </form>

      <Analytics />
    </div>
  )
}

export default App
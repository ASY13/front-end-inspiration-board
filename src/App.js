import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import BoardSelector from "./components/BoardSelector";
import NewBoardForm from "./components/NewBoardForm";
import LowerBody from "./components/LowerBody";

function App() {
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    getBoards();
  }, []);

  const getBoards = () => {
    axios
      // this URL was given by Ada in readme, /boards endpoint is specific to which backend enpoint we want to access
      .get(`${process.env.REACT_APP_BACKEND_URL}/boards`)
      // result is the object/promise that will come from the backend and that object in this case is
      // a list of Board objects
      .then((result) => {
        // setBoards is reassigning the state of boards to whatever came through with the axios/ promise/data
        setBoards(result.data);
      });
  };
  // boardId is a parameter for the function to access the specific board
  const getCards = (boardId) => {
    axios
      // this axios endpoint mirrors the back-end endpoint for getting all cards for one board
      .get(`${process.env.REACT_APP_BACKEND_URL}/boards/${boardId}/cards`)
      .then((result) => {
        setCards(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // New Board
  const handleAddBoard = (boardInfo) => {
    // add newBoard to db and display updated board selections
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/boards`, {
        // this is the request body for the newBoard object
        title: boardInfo.title,
        author: boardInfo.ownersName,
      })
      .then((result) => getBoards())
      .catch((error) => alert(error.response.data.details));
  };

  // New Card
  const handleAddCard = (message) => {
    // add newCard to db
    axios
      // endpoint matches the endpoint in the backend
      .post(`${process.env.REACT_APP_BACKEND_URL}/cards`, {
        // request body for newCard object, including boardID so the right board gets the cards
        // associated with it
        message,
        board_id: selectedBoard.id,
      })
      .then((result) => getCards(selectedBoard.id))
      .catch((error) => alert(error.response.data.details));
  };

  const updateCurrentBoard = (boardId) => {
    const board = boards.filter((board) => board.id === parseInt(boardId))[0];
    setSelectedBoard(board);
    getCards(board.id);
  };

  // here selectedCard is a reference to what is being passed to it, which is one item from the
  // state, cards,
  const increaseLikes = (selectedCard) => {
    axios
      .patch(`${process.env.REACT_APP_BACKEND_URL}/cards/${selectedCard.id}`, {
        likes: selectedCard.likes + 1,
      })
      // in order to change one card, all cards state have to be replaced with getCards
      .then((result) => getCards(selectedBoard.id))
      .catch((error) => alert(error.response.data.details));
  };

  const deleteOneCard = (selectedCard) => {
    axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/cards/${selectedCard.id}`)
      .then((result) => getCards(selectedBoard.id))
      .catch((error) => alert(error.response.data.details));
  };
  return (
    <div className="App">
      <header className="App-header"></header>
      <main>
        {/* NewBoardForm is used and addBoard function is passed as prop named onAddBoard */}
        <NewBoardForm onAddBoard={handleAddBoard} />
        <BoardSelector boards={boards} onSelectBoard={updateCurrentBoard} />
        {/* conditional logic to check for condition being satisfied to activate LowerBody */}
        {selectedBoard && (
          <LowerBody
            // this is the list of all the props being assigned that LowerBody will use
            onAddCard={handleAddCard}
            board={selectedBoard}
            cards={cards}
            onIncreaseLikes={increaseLikes}
            onDeleteOneCard={deleteOneCard}
          ></LowerBody>
        )}
      </main>
    </div>
  );
}

export default App;

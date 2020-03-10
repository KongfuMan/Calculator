import React from 'react';
import './App.css';
import Main from './components/Main';
import {BrowserRouter, Route} from 'react-router-dom';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Route exact={true} path="/" component={Main}></Route>
            </BrowserRouter>
        </div>
    );
}

export default App;

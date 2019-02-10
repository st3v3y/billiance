import React, { Component } from 'react';
import './App.scss';
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import Notification from 'react-notify-toast';
import ClientList from './components/ClientList';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'


HTMLElement.prototype.toggleShow = function() {
  let style = this.style;
  if(style.display === 'block'){
    style.display = 'none';
    this.parentElement.classList.remove("open");
  } else{
    style.display = 'block';
    this.parentElement.classList.add("open");
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    library.add(faTrashAlt)

  }

  render() {
    return (
      <div className='container'>
        <Notification />
        <ClientList />
      </div>
    );
  }
}



export default App;

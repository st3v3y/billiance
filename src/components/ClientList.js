import React, { Component } from 'react';
import ClientListItem from './ClientListItem'
import ReactLoading from 'react-loading';
import PouchDB from 'pouchdb'
import {notify} from 'react-notify-toast';
import exchangeRatesFallback from '../exchange-rates-fallback.json';
import { SettingsContext } from '../SettingsContext'

class ClientList extends Component {
  clientDB = null;

  exchangeRateCacheName = '';
  defaultCurrency = '';
  
  constructor(props) {
    super(props);

    this.state = { 
      clients: [],
      newClientName: '',
      isLoading: true
    };
    
    this.addClient = this.addClient.bind(this);
    this.handleClientDeleted = this.handleClientDeleted.bind(this);
    this.handleOnChangeNewClientName = this.handleOnChangeNewClientName.bind(this);
    this.onUpdateSubmit = this.onUpdateSubmit.bind(this);
  }
  
  componentWillMount() {
    this.clientDB = new PouchDB('clients');

    this.defaultCurrency = this.context.defaultCurrency;
    this.exchangeRateCacheName = this.context.getExchangeRateCacheName();

    this.getAllClients();
    this.getExchangeRates();
  }

  getAllClients(){
    this.clientDB
      .allDocs({include_docs: true})
      .then((doc) => {
        console.debug('------ GETTING ALL CLIENTS ---');
        this.setState({clients : doc.rows});
      });
  }

  addClient(){
    console.debug('------ ADDING NEW CLIENT  ---', this.state.newClientName);

    this.clientDB.put({
      "_id": new Date().valueOf().toString(),
      "name": this.state.newClientName
    });

    this.setState({newClientName : ''});
    this.getAllClients();
  }

  handleClientDeleted(id){
    const db = this.clientDB;
    db.get(id)
      .then((doc) =>{
        return db.remove(doc);
      })
      .then(() => this.getAllClients());
  }

  handleOnChangeNewClientName(event) {
    this.setState({newClientName : event.target.value});
  }

  onUpdateSubmit(){
    this.getAllClients();
  }

  getExchangeRates(){
    if(localStorage.getItem(this.exchangeRateCacheName) === null){
      this.getExchangeRatesApi();
    }else {
      this.setState({isLoading: false});
    }
  }

  timeout(ms, promise) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject(new Error("timeout"))
      }, ms)
      promise.then(resolve, reject)
    })
  }

  getExchangeRatesApi(){
    const makeCall = fetch('https://api.exchangeratesapi.io/latest?base=' + this.defaultCurrency)
      .then((result) => result.json())
      .then((result) => {
        console.log("--------- RECEIVED RATES ------ ", result);
        localStorage.setItem(this.exchangeRateCacheName, JSON.stringify(result));
      });
    
    const that = this;
    this.timeout(5000, makeCall)
      .then(function(response) {
        that.setState({isLoading: false});
      }).catch(function(error) {
        // might be a timeout error or no internet connection
        notify.show("Could not receive latest currency rates!", "warning");
        console.debug(error);
        
        //TODO: with this approch it never updates at the same day
        localStorage.setItem(that.exchangeRateCacheName, JSON.stringify(exchangeRatesFallback)); 
        that.setState({isLoading: false});
      })
  }

  render(){
    this.defaultCurrency = this.context.defaultCurrency;

    if(this.state.isLoading) {
      return <ReactLoading type={'spin'} color={'#000'} />
    }

    const clientList = this.state.clients.map((item, i) =>{
      return <ClientListItem 
          key={item.doc._id} 
          client={item.doc} 
          onDeleted={this.handleClientDeleted}
          onUpdateSubmit={this.onUpdateSubmit}
        />;
    });

    return <div className="client-list">
          {clientList}  
          <div className="add-client-form">
          <input type="text" onChange={this.handleOnChangeNewClientName} />
          <button className="button" onClick={() => this.addClient()}>Add Client</button>
        </div>
    </div>;
  }
}
ClientList.contextType = SettingsContext;

export default ClientList;
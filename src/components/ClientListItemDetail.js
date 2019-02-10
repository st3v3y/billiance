import React, { Component } from 'react';
import PouchDB from 'pouchdb'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Loadable from 'react-loadable';
import ReactLoading from 'react-loading';

export default class ClientListItemDetail extends Component {
    clientDB = null;
  
    constructor(props) {
      super(props);
      this.state = { 
        client: this.props.client
      };
  
      this.handleOnChangeClientName = this.handleOnChangeClientName.bind(this);
      this.handleClientDetailSubmit = this.handleClientDetailSubmit.bind(this);
    }
  
    componentWillMount() {
      this.clientDB = new PouchDB('clients');
    }
  
    handleClientDetailSubmit(event){
      event.preventDefault();
  
      const db = this.clientDB;
      const client = this.state.client;
  
      console.log('Saving Client (ID: ' + client._id + ')');
      db.get(client._id)
        .then((doc) => {
          doc.name = client.name;
          return db.put(doc);
        })
        .then(() => this.props.onUpdateSubmit());
    }
  
    handleOnChangeClientName(event) {
      var name = event.target.value;
  
      this.setState((prefState) => {
        prefState.client.name = name;
  
        return { client : prefState.client };
      });
    }
  
    render() {
      return <Tabs>
        <TabList>
          <Tab>Bills</Tab>
          <Tab>Basic Data</Tab>
        </TabList>
        <TabPanel>
          <h1 className="title">The Bills</h1>
          <BillListLazy clientid={this.state.client._id}/>
        </TabPanel>
        <TabPanel>
          <form onSubmit={this.handleClientDetailSubmit}> 
            <input 
              type="text" 
              value={this.state.client.name} 
              onChange={this.handleOnChangeClientName} 
              />
            <button>Update</button>
          </form>
        </TabPanel>
      </Tabs>
    }
}

const BillListLazy = Loadable({
    loader: () => import('./BillList'),
    loading: () =>  <ReactLoading />
});
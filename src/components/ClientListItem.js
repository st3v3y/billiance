import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import Loadable from 'react-loadable';
import ReactLoading from 'react-loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class ClientListItem extends Component {
    constructor(props) {
      super(props);
      this.state = { 
        client: this.props.client,
      };
  
      this.onUpdateSubmit = this.onUpdateSubmit.bind(this);
    }
  
    deleteClient (id, name) {
      confirmAlert({
        title: 'Delete Client',
        message: `Do you really want to delete "${name}"?`,
        buttons: [
          {
            label: 'Yes',
            onClick: () => this.props.onDeleted(id)
          },
          {
            label: 'No'
          }
        ]
      })
    }
  
    onUpdateSubmit(){
      this.props.onUpdateSubmit();
      this.refs['detail'].toggleShow();
    }
   
    render() {
      const { client } = this.props;
  
      let detailRef = 'detail';
  
      return (
        <div className='client-list-item' key={client._id}>
            <div className='client-list-item-header'>
                <span className='name' onClick={() => this.refs[detailRef].toggleShow()}>{client.name} ({client._id})</span>
                <FontAwesomeIcon className='delete' onClick={() => this.deleteClient(client._id, client.name)} icon="trash-alt" />
            </div>
             
            <div className='client-detail' style={{display:'none'}} ref={detailRef} >
                <ClientListItemDetailLazy client={client} onUpdateSubmit={this.onUpdateSubmit} />
            </div>
        </div>
      );
    }
}


const ClientListItemDetailLazy = Loadable({
    loader: () => import('./ClientListItemDetail'),
    loading: () => <ReactLoading />,
    delay: 8000,
});
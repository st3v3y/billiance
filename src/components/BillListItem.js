import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency, formatDate } from '../helpers/format'

export default class BillListItem extends Component {
    deleteBill (id, name) {
        confirmAlert({
            title: 'Delete Bill',
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
        });
    }

    render() {
        const { bill } = this.props;

        return (
            <div className='bills-list-item'>
                <span className='date'>{formatDate(bill.asOfDate)}</span>
                <span className='name'>{bill.name}</span>
                <span className='amount'>{formatCurrency(bill.amount, bill.currency)}</span>
                <span className='currency'>{bill.currency}</span>
                <FontAwesomeIcon className='delete' onClick={() => this.deleteBill(bill._id, bill.name)} icon="trash-alt" />
            </div>
        );
    }
}
  
import React, { Component } from 'react';
import PouchDB from 'pouchdb'
import PouchdbFind from 'pouchdb-find';
import { SettingsContext } from '../SettingsContext'
import BillListItem from './BillListItem'
import { Form, TextArea, Text, Select, Option, reset } from 'informed';
import { DateInput } from '../CustomFormElements'

export default class BillList extends Component {
    billsDB = null;
    defaultCurrency = '';

    static contextType = SettingsContext;
  
    constructor(props) {
      super(props);
  
      this.state = {
        bills : [],
        statistic : {
            defaultCurrency : {},
            otherCurrency : [],
            total : {
                amount: 0,
                taxes: 0
            }
        },
        exchangeRates: {},
        defaultCurrencySum : {},
        otherCurrencySums : []
      };
  
      PouchDB.plugin(PouchdbFind);

      this.handleOnBillDeleted = this.handleOnBillDeleted.bind(this);
      this.handleOnFormSubmit = this.handleOnFormSubmit.bind(this);
      this.getBillSum = this.getBillSum.bind(this);
    }
  
    componentWillMount() {
      this.billsDB = new PouchDB('bills');

      const exchangeRateCacheName = this.context.getExchangeRateCacheName();
      const rates = localStorage.getItem(exchangeRateCacheName);  
  
      this.defaultCurrency = this.context.defaultCurrency;
      this.setState({exchangeRates : JSON.parse(rates) });
  
      this.getAllBills();
    }
  
    getAllBills(){
      let db = this.billsDB;
      db.createIndex({
          index: { fields: ['clientId'] }
        }).then(() => {
          db.find({
            selector: {
              clientId: this.props.clientid
            }
          }).then((result) => {
            console.debug('------ GETTING ALL BILLS ---');
            
            this.setState({bills : result.docs});
            this.getBillSum();
          });
        });
    }
  
    handleOnBillDeleted(id){
        const db = this.billsDB;
        db.get(id)
          .then((doc) =>{
            return db.remove(doc);
          })
          .then(() => this.getAllBills());
    }

    handleOnFormSubmit(values){
        console.debug('------ SUBMITTING FORM FOR NEW BILL ---');
        console.log(values);
        
        values._id = new Date().valueOf().toString();
        values.clientId = this.props.clientid;
    
        this.billsDB.put(values);
        this.getAllBills();
    }
  
    getRatesArray(){
      let currencies = [];
      let rates = this.state.exchangeRates.rates;
      for (var property in rates) {
        if (rates.hasOwnProperty(property)) {
            currencies.push(property);
        }
      }
      return currencies;
    }

    getBillSum() {
        let defaultCurrencyAmountSum = 0.0;
        let defaultCurrencyTaxSum = 0.0;
        let otherCurrencySums = [];
        let total = 0.0;
        let totalTaxes = 0;

        for(var item of this.state.bills){
            if(!item.currency || item.currency === this.defaultCurrency){
                let amountFloat = parseFloat(item.amount);
                let taxRateFloat = parseFloat(item.taxRate || 19);

                defaultCurrencyAmountSum += amountFloat;
                defaultCurrencyTaxSum += (amountFloat * taxRateFloat / 100);
            } else {

                // eslint-disable-next-line no-loop-func
                var found = otherCurrencySums.find(element => { 
                    return element.currency === item.currency 
                });

                let amountFloat = parseFloat(item.amount).toFixed(2);
                let taxFloat = parseFloat(item.taxRate) || 19; //TODO: make this variable!
                const tax =   (amountFloat * taxFloat / 100).toFixed(2);

                if(!found){
                    otherCurrencySums.push({
                        currency: item.currency,
                        amount: amountFloat,
                        tax : tax
                    });
                } else {
                    found.amount += amountFloat;
                    found.tax += tax;
                }

                total += this.convertCurrency(item.currency, this.defaultCurrency, amountFloat);
                totalTaxes += this.convertCurrency(item.currency, this.defaultCurrency, tax);
            }
        }

        total += defaultCurrencyAmountSum;
        totalTaxes += defaultCurrencyTaxSum; 

        this.setState({statistic : {
            defaultCurrency : {
                amount : defaultCurrencyAmountSum.toFixed(2),
                tax : defaultCurrencyTaxSum.toFixed(2),
                currency : this.defaultCurrency
            },
            otherCurrency : otherCurrencySums,
            total : {
                amount: total.toFixed(2),
                taxes: totalTaxes.toFixed(2)
            }
        }});
    }

    convertCurrency(fromCurrency, toCurrency, value){
        if(fromCurrency !== this.defaultCurrency && toCurrency !== this.defaultCurrency) {
            throw Error("One of the currencies has to be the defauly currency");
        }

        console.debug('------ CONVERTING FROM ', fromCurrency, ' to ', toCurrency, ' ---');

        if(fromCurrency === this.defaultCurrency){
            const toRate = parseFloat(this.state.exchangeRates.rates[toCurrency]);
            return (value * toRate);
        } else {
            const fromRate = parseFloat(this.state.exchangeRates.rates[fromCurrency]);
            return (value / fromRate);
        }
    }
  
    render() {
        const clientBills = this.state.bills.map((item, i) => {
            return <BillListItem 
                key={item._id} 
                bill={item} 
                onDeleted={this.handleOnBillDeleted}
                onUpdateSubmit={this.onUpdateSubmit}
            />
        });

        return (
            <div className='bills-list-container'>
                <div className='bills-list'>
                    {clientBills}
                    <BillSum data={this.state.statistic} />
                </div>

                <Form id="simple-form" onSubmit={this.handleOnFormSubmit} className='add-bill-form' >
                    <label htmlFor="name-field">Name:</label>
                    <Text field="name" id="name-field" />
        
                    <label htmlFor="asofdate-field">Date:</label>
                    <DateInput field="asOfDate" id="asofdate-field" />
        
                    <label htmlFor="desc-bio">Notes:</label>
                    <TextArea field="desc" id="desc-bio" />
        
                    <label htmlFor="amount-field">Amount:</label>
                    <Text field="amount" id="amount-field" />
        
                    <label htmlFor="currency-field">Currency:</label>
                    <Select field="currency" id="currency-field" initialValue={this.defaultCurrency}>
                        <Option value={this.state.exchangeRates.base}>{this.state.exchangeRates.base}</Option>
                        {this.getRatesArray().map((val, i) => {
                            return <Option key={i} value={val}>{val}</Option>
                        })}
                    </Select>
        
                    <button type="submit">
                        Submit
                    </button>
                </Form>
            </div>
        );
    }
}
BillList.contextType = SettingsContext;


class BillSum extends Component { 
    render() {
        const { data } = this.props;

        const otherCurrencySumsOut = data.otherCurrency.map((item, i) => {
            return <span key={i}>
                <span className="amount">{item.amount}</span> 
                <span className="div"> / </span> 
                <span className="netto">{item.tax}</span> 
                <span className="currency">{item.currency}</span>
            </span>
        });
        
        const defaultSum = data.defaultCurrency;
        return (<div className="bill-sum">
            {data.otherCurrency.length > 0 && 
                <span>
                    <div className="other-currencies">{otherCurrencySumsOut}</div>
                    <div className="default-currency">
                        <span className="amount">{defaultSum.amount}</span> 
                        <span className="div"> / </span> 
                        <span className="netto">{defaultSum.tax}</span> 
                        <span className="currency">{defaultSum.currency}</span>
                    </div>
                </span>
            }
            <div className="total">
                <span className="amount">{data.total.amount}</span> 
                <span className="div"> / </span> 
                <span className="netto">{data.total.taxes}</span> 
                <span className="currency">{defaultSum.currency}</span>
            </div>
        </div>);
    }
}


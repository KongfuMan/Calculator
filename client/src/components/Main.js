import React, {Component} from 'react';
import socketIOClient from "socket.io-client";
import './Main.css';


const axios = require('axios');
class Main extends Component{
    constructor(props){
        super(props);
        this.state = {
            formulas:[],
            leftValue: 0,
            rightValue: 0,
            operator: '+',
            submitUser: false,
            username : ""
        }

    }

    setFormularData(data){
        this.state.formulas.push(data);
        this.setState({formulas: this.state.formulas});
    }

    componentDidMount(){

    }

    handleSubmitUser(){
        this.setState({submitUser : true});
        axios.get('/index',{}).then(res=>{
            console.log(res.data);
            this.setState({formulas: res.data.formulas || []});
        });
        const production  = 'https://thawing-castle-87375.herokuapp.com';
        const development = 'http://localhost:3000/';
        const url = (process.env.NODE_ENV ? production : development);
        const endpoint = "https://localhost:" + (process.env.PORT || 443);
        this.socket = socketIOClient(url);
        this.socket.on("calculate", data => {
            this.state.formulas.push(data || "");
            this.setState({formulas: this.state.formulas});
        });
    }

    handleLeftChange(event){
        this.setState({leftValue: event.target.value});
    }

    handleRightChange(event){
        this.setState({rightValue: event.target.value});
    }

    handleOperatorChange(event){
        console.log(event.target.value);
        this.setState({operator: event.target.value});
    }

    renderFormulas(){
        return this.state.formulas.map((f,i)=>{
            return (
                <li key={i}>{f}</li>
            );
        })
    }

    handleUsernameChange(event){
        this.setState({username: event.target.value});
    }

    handleSubmit(){
        console.log(this.state.leftValue);
        console.log(this.state.rightValue);
        console.log(this.state.operator);
        this.socket.emit('calculate',{
            m: this.state.leftValue,
            n: this.state.rightValue,
            p: this.state.operator
        });
    }

    render(){
        if (!this.state.submitUser){
            return (<div>
                <label className="label-style">Input user name</label>
                <input type="text" value={this.state.username}
                       onChange={(e)=>{this.handleUsernameChange(e)}} />
                <button className="btn-primary" onClick={()=>this.handleSubmitUser()}>Submit</button>
            </div>);
        }
        return(
            <div className="card card-style">
                <div>Total formula count {this.state.formulas.length}</div>
                <ul className="formula-list">
                    {this.renderFormulas()}
                </ul>
                <label className="label-style">
                    <input type="text" value={this.state.leftValue}
                           onChange={(e)=>{this.handleLeftChange(e)}} />
                    <select value={this.state.operator}
                            onChange={(e)=>this.handleOperatorChange(e)}>
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="*">*</option>
                        <option value="/">/</option>
                    </select>
                    <input type="text" value={this.state.rightValue}
                           onChange={(e)=>{this.handleRightChange(e)}} />
                </label>
                <button className="btn-primary" onClick={()=>this.handleSubmit()}>Submit</button>
            </div>
        );
    }
}

export default Main;

import React from "react";
import Display from "./Display";
import "./App.css";
import Button from "./Button";

export default class App extends React.Component {
    state = {
        total: null,
        next: null,
        operation: null,
        classView: null,
        user_name: null,
        first_name: 'Guest #42'
    };

    updateClassView = function (name) {
        return {
            classView: name
        }
    }

    handleClick = buttonName => {
        console.log("APP:" + this.state.classView)
        this.setState(this.updateClassView(buttonName))
    };

    render() {
        return (
            <div className="component-app">
                <div className="component-menu">
                    <div>
                        <Button id="USER" name="REGISTER/LOGIN" onClick={this.handleClick} orange/>
                    </div>
                    <div>
                        <Button id="GROUPS-ADMINS" name="GROUPS/ADMINS" onClick={this.handleClick} orange/>
                    </div>
                    <div>
                        <Button id="NEW-POLL" name="NEW POLL" onClick={this.handleClick} orange/>
                    </div>
                    <div>
                        <Button id="POLLS" name="POLLS" onClick={this.handleClick} orange/>
                    </div>
                </div>
                <Display viewName={this.state.classView} user_first_name={this.state.first_name}/>
            </div>
        );
    }
}

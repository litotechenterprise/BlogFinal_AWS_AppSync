import { Auth } from 'aws-amplify'
import React, {Component} from 'react'

export default class EditPost extends Component {
    state = { 
        show:false,
        id:'',
        postOwnerId:"",
        postOwnerUsername:"",
        postTitle:"",
        postBody:"",
        postData: {
            postTitle: this.props.postTitle,
            postBody: this.props.postBody
        }
    }

    componentDidMount = async () => {
        await Auth.currentUserInfo()
            .then( user => {
               this.setState({
                    postOwnerId:user.attributes.sub,
                    postOwnerUsername:user.username,
               })
            })
    }

    handleModal = () => {
        this.setState({ show: !this.state.show})
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
    }

    handleUpdatedPost = () => {

    }

    handleTitle = () => {

    }

    handleBody = () => {

    }

    render() {
        return(
            <>
                {this.state.show && (
                    <div className="modal">
                        <button className="close" onClick={this.handleModal}> X </button>

                        <form className="add-post" onSubmit={(event) => this.handleUpdatedPost(event)}>
                            <input 
                                style={{fontSize: "19px"}}
                                type="text"
                                name='postTitle'
                                value={this.state.postData.postTitle}
                                onChange={this.handleTitle}
                            />

                            <input 
                                style={{fontSize: "19px", height:'150px'}}
                                type="text"
                                name='postBody'
                                value={this.state.postData.postBody}
                                onChange={this.handleBody}
                             />

                            <button>Update Post</button>
                        </form>
                    </div>

                   
                )}
                <button onClick={this.handleModal}>Edit</button>
            </>

            
        )
    }
}
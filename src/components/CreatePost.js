import React, {Component} from 'react'
import { API, Auth, graphqlOperation } from 'aws-amplify'
import { createPost } from '../graphql/mutations'


class CreatePost extends Component {
    state = {
        postOwnerId:"",
        postOwnerUsername:"",
        postTitle:"",
        postBody:"",
    }

    componentDidMount = async () => {
        await Auth.currentUserInfo()
            .then(user => {
                this.setState({
                    postOwnerId: user.attributes.sub,
                    postOwnerUsername: user.username
                })
            })
    }

    handleChangePost = event => this.setState({ 
        [event.target.name] : event.target.value
    })

    handleAddPost = async(event) => {
        event.preventDefault()
        const input = {
            postOwnerId: this.state.postOwnerId, 
            postOwnerUsername: this.state.postOwnerUsername, 
            postTitle:this.state.postTitle,
            postBody:this.state.postBody,
            createdAt: new Date().toISOString(),
        }

        await API.graphql(graphqlOperation(createPost, { input }))
        this.setState({postBody:"", postTitle:""})
    }

    render() {
        return (
            <form className='add-post' onSubmit={this.handleAddPost}>
                <input style={{font:'19px'}} 
                    type="text" 
                    placeholder="Title" 
                    required 
                    value={this.state.postTitle}
                    onChange={this.handleChangePost}
                    name="postTitle"
                />
                <textarea 
                    type="text" 
                    name="postBody" 
                    rows="3" col="40" 
                    required 
                    placeholder="New Blog Post"
                    value={this.state.postBody}
                    onChange={this.handleChangePost}
                />
                <input type="submit" className="btn" style={{font:'19px'}}/>
            </form>
        )
    }
}

export default CreatePost;
import React, {Component} from 'react'
import { listPosts } from '../graphql/queries'
import { onCreatePost, onDeletePost } from '../graphql/subscriptions'
import { API, graphqlOperation } from 'aws-amplify'
import DeletePost from './DeletePost'
import EditPost from './EditPost'

class DisplayPosts extends Component {

    state = {
        posts: []
    }

    componentDidMount = async () => {
        this.getPosts()

        this.createPostListener = API.graphql(graphqlOperation(onCreatePost))
            .subscribe({
                next: postData => {
                    const newPost = postData.value.data.onCreatePost
                    const prevPost = this.state.posts.filter(post => post.id !== newPost.id)

                    const updatedPosts = [newPost, ...prevPost]
                    this.setState({ posts: updatedPosts})
                }
            })
        
        this.deletePostListener = API.graphql(graphqlOperation(onDeletePost))
            .subscribe({
                next: postData => {
                    const deletedPost = postData.value.data.onDeletePost
                    const updatedPost = this.state.posts.filter(post => post.id !== deletedPost.id)

                    this.setState({posts: updatedPost})
                }
            })
    }

    componentWillUnmount() {
        this.createPostListener.unsubcribe()
        this.deletePostListener.unsubcribe()
    }

    getPosts = async() => {
        const results = await API.graphql(graphqlOperation(listPosts))
        this.setState({posts: results.data.listPosts.items})
        // console.log("ALL Posts: " + JSON.stringify(results.data.listPosts.items))
    }

    render() {
        const {posts}  = this.state
        return posts.map((post) => {
            return(
                <div className="posts" style={rowstyle} key={post.id}>
                    <h1>{ post.postTitle }</h1>
                    <span style={{fontStyle:"italic", color:'#0ca5e297'}}>
                        { "Wrote by: "} { post.postOwnerUsername}

                        {" on "}
                        <time style={{fontStyle:"italic"}}>
                            {" "}
                            { new Date(post.createdAt).toDateString()}
                        </time>
                    </span>
                    <p>{post.postBody}</p>
                    <br />
                    <span>
                        <DeletePost data={post}/>
                        <EditPost/>
                    </span>
                </div>
            )
        })
    }
}

const rowstyle ={
    background: '#f4f4f4',
    padding: '10px',
    border: '1px #ccc dotted',
    margin: '14px'
}

export default DisplayPosts;
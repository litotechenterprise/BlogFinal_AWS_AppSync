import React, {Component} from 'react'
import { listPosts } from '../graphql/queries'
import { onCreatePost, onDeletePost, onUpdatePost, onCreateComment} from '../graphql/subscriptions'
import { API, graphqlOperation } from 'aws-amplify'
import DeletePost from './DeletePost'
import EditPost from './EditPost'
import CreateCommentPost from './CreateCommentPost'
import CommentPost from './CommentPost'
import { updatePost } from '../graphql/mutations'

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

        this.updatePostListener = API.graphql(graphqlOperation(onUpdatePost))
            .subscribe({
                next: postData => {
                    const {posts} = this.state
                    const updatedPost = postData.value.data.onUpdatePost
                    const index  = posts.index(post => post.id === updatedPost.id)
                    const updatedPosts = [...posts.slice(0, index), updatePost, ...posts.slice(index + 1)]

                    this.setState({ posts: updatedPosts})
                }
            })
        
        this.createPostCommentListener = API.graphql(graphqlOperation(onCreateComment))
            .subscribe({
                next: commentData => {
                    const createComment = commentData.value.data.onCreateComment
                    let posts = [...this.state.posts]
                    for(let post of posts){
                        if(createComment.post.id === post.id) {
                            post.comments.items.push(createComment)
                        }
                    }
                    this.setState({posts})
                }
            })
    }

    componentWillUnmount() {
        this.createPostListener.unsubcribe()
        this.deletePostListener.unsubcribe()
        this.updatePostListener.unsubcribe()
        this.createPostCommentListener.unsubcribe()
    }

    getPosts = async() => {
        const results = await API.graphql(graphqlOperation(listPosts))
        this.setState({posts: results.data.listPosts.items})
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
                        <EditPost {...post}/>
                    </span>
                    <span>
                         <CreateCommentPost postId={post.id}/>
                            { post.comments.items.length > 0 && <span style={{fontSize:'19px', color:'gray'}}>Comments: </span>}
                            {
                                post.comments.items.map((comment, index) => <CommentPost key={index} commentData={comment}/>)
                            }  
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
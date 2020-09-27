import React, {Component} from 'react'
import { listPosts } from '../graphql/queries'
import { onCreatePost, onDeletePost, onUpdatePost, onCreateComment, onCreateLike} from '../graphql/subscriptions'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import DeletePost from './DeletePost'
import EditPost from './EditPost'
import CreateCommentPost from './CreateCommentPost'
import CommentPost from './CommentPost'
import { updatePost, createLike } from '../graphql/mutations'
import {  FaThumbsUp} from 'react-icons/fa'

class DisplayPosts extends Component {

    state = {
        ownerId:"",
        ownerUsername: "",
        posts: [],
        isHovering: false,
        errMsg:'',
        postLikedBy: [],
    }

    componentDidMount = async () => {
        this.getPosts()

        await Auth.currentUserInfo()
            .then(user => {
                this.setState({
                    ownerId:user.attributes.sub,
                    ownerUsername: user.username
                })
            })

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

        this.createPostLikeListener = API.graphql(graphqlOperation(onCreateLike))
            .subscribe({
                next: postData => {
                    const createdLike = postData.value.data.onLikePost
                    let posts = [...this.state.posts]
                    for(let post of posts) {
                        if(createdLike.post.id === post.id) {
                            post.likes.items.push(createdLike)
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
        this.createPostLikeListener.unsubcribe()
    }

    getPosts = async() => {
        const results = await API.graphql(graphqlOperation(listPosts))
        console.log(results)
        this.setState({posts: results.data.listPosts.items})
    }

    likedPost = (postid) => {
        for(let post of this.state.posts) {
            if(post.id === postid) {
                if(post.postOwnerId === this.state.ownerId) 
                    return true
                for(let like of post.likes.items) {
                    if(like.likeOwner.id === this.state.ownerId)
                        return true
                }
            }
        }

        return false
    }

    handleLike = async(postId) => {
        if(this.likedPost(postId)) { return this.setState({errMsg:"Cannont like your own post"})}
        const input = {
            numberLikes:1,
            likeOwnerId: this.state.ownerId,
            likeOwnerUsername: this.state.ownerUsername,
            likePostId: postId 
        }

        try {
            const results = await API.graphql(graphqlOperation(createLike, {input}))
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        const {posts}  = this.state
        let LoggedInUser = this.state.ownerId
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
                        {post.postOwnerId === LoggedInUser && 
                            <DeletePost data={post}/>
                        }

                        {post.postOwnerId === LoggedInUser && 
                              <EditPost {...post}/>
                        }
                       
                        <span>
                            <p className="alert"> {post.postOwnerId === LoggedInUser && this.state.errMsg}</p>
                            <p onClick={() => this.handleLike(post.id)}><FaThumbsUp />
                                {post.likes.items.length}
                            </p>
                        </span>
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
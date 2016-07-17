var {Navbar, NavItem, NavDropdown, Nav, MenuItem, PageHeader, Glyphicon, Badge, Button} = require('react-bootstrap')
let React = require('react')
let request = require('request')
let baseUrl = 'http://localhost:3001'
let {Link} = require('react-router')
let Doc = require('./doc.jsx')
let Query = require('./query.jsx')


let Docs = React.createClass({
  getInitialState(){
    console.log('hey')
    return {docs: [], query: {}}
  },
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  fetch(dbName, collectionName, query) {
    dbName = dbName || this.props.params.dbName
    collectionName = collectionName || this.props.params.collectionName
    query = query || this.props.location.query || {}
    request({url: `${baseUrl}/api/dbs/${dbName}/collections/${collectionName}`,
      json: true,
      qs: {query: JSON.stringify(query)},
      withCredentials: false},
      (error, response, body) =>{
        console.log(body)
        this.props.location.query = query
        this.setState({docs: body.docs, query: query})
    })
  },
  componentDidMount() {
    this.fetch()
  },
  componentWillReceiveProps(nextProps){
    if (this.props.params.dbName != nextProps.params.dbName ||
      this.props.params.collectionName != nextProps.params.collectionName) this.fetch(nextProps.params.dbName, nextProps.params.collectionName)
  },
  applyQuery(query){
    console.log(query);
    this.setState({query: query}, ()=>{
      this.fetch(null, null, query)
    })


    // let dbName =  this.props.params.dbName
    // let collectionName =this.props.params.collectionName
    // this.context.router.replace({
    //   pathname: `/dbs/${dbName}/collections/${collectionName}`,
    //   query: query,
    //   docs: this.state.docs
    // })
    // this.fetch(query)
  },
  applyEditDoc(doc, index, callback){
    request({
      method: 'PATCH',
      url: `${baseUrl}/api/dbs/${this.props.params.dbName}/collections/${this.props.params.collectionName}/${doc._id}`,
      json: doc,
      withCredentials: false},
      (error, response, body) =>{
        // console.log(body)
        if (body.ok = 1) {
          let docs = this.state.docs
          docs[index] = doc
          this.setState({docs: docs})
          // apply query or not?
          return callback('Document updated')
        }
        callback('Error updating')
    })
  },

  deleteDoc(doc, index, callback){
    console.log("got to deleteDoc within docs.jsx")
    request({
      method: 'DELETE',
      url: `${baseUrl}/api/dbs/${this.props.params.dbName}/collections/${this.props.params.collectionName}/${doc._id}`,
      json: doc,
      withCredentials: false},
      (error, response, body) =>{
        if  (body.ok === 1){ //(body.ok = 1)
          let docs = this.state.docs;
          docs.splice(index, 1);
          this.setState({docs: docs});
          //
          console.log("Delete request successful");
          return callback('Document Deleted');
        }
        callback('Error Deleting updating')
    })
  },
  render() {
    // console.log(this.state, this.props.params)
    return <div>
      <PageHeader>Docs <Query applyQuery={this.applyQuery} {...this.props}/></PageHeader>


      <span>[{this.props.params.collectionName}]</span>

        {this.state.docs.map((doc, index)=>{
          return <Doc doc={doc} key={doc._id} index={index} applyEditDoc={this.applyEditDoc}/>
        })}
        <div>{this.props.children}</div>
    </div>
  }
})

module.exports = Docs

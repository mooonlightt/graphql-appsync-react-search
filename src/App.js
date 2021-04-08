import React from 'react';
import './App.css';
import gql from 'graphql-tag'
import { graphql, compose } from 'react-apollo'

import debounce from 'lodash/debounce' 

const SearchIceCreams = gql`
  query($searchQuery: String) {
    listIceCreams(filter: {
      description: {
        contains: $searchQuery
      }
    }) {
      items {
        name
        description
      }
    }
  }
` 

const ListIceCreams = gql`
  query {
    listIceCreams {
      items {
        name
        description
      }
    }
  }
` // 3

function App (props)  {

  let searchQuery = '';
  const onChange = (e) => { 
    const value = e.target.value
    handleFilter(value)
  }
  const handleFilter = debounce((val) => { 
    props.setSearchQuery(val)
  }, 250)
 
    const { loading } = props.data
    const { items } = props.data.listIceCreams
    return (
      <div className="App">
        <p style={{color :"#df5434"}}><h2>Search per ice cream description</h2></p>
        <input
          style={styles.input}
          onChange={onChange}
          placeholder='Search for ice cream'
        />
        { // 7
          !!loading && (
            <p>Searching...</p>
          )
        }
        { // 8
          !loading && !items.length && (
            <p>Sorry, no results.</p>
          )
        }
        { // 9
          !loading && items.map((item, index) => (
            <div key={index} style={styles.container}>
              <p style={styles.title}>{item.name}</p>
              <p style={styles.description}>{item.description}</p>
            </div>
          ))
        }
      </div>
    );
  
}

export default compose(
  graphql(ListIceCreams, {
    options: data => ({
      fetchPolicy: 'cache-and-network'
    }),
    props: props => ({
      setSearchQuery: searchQuery => {
        return props.data.fetchMore({
          query: searchQuery === '' ? ListIceCreams : SearchIceCreams, 
          variables: {
            searchQuery
          },
          updateQuery: (previousResult, { fetchMoreResult }) => ({ 
            ...previousResult,
            listIceCreams: {
              ...previousResult.listIceCreams,
              items: fetchMoreResult.listIceCreams.items
            }
          })
        })
      },
      data: props.data
    })
  })
)(App);

const styles = {
  container: {
    padding: 10,
    borderBottom: '1px solid #ddd'
  },
  title: {
    fontSize: 18
  },
  description: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, .5)'
  },
  input: {
    height: 40,
    width: 300,
    padding: 7,
    fontSize: 15,
    outline: 'none'
  }
}
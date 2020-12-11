import React, { useState, useEffect } from "react";
import "./App.css";
import Axios from "axios";
import Pagination from "./Pagination";

function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("1");

  const [newAge, setNewAge] = useState("");
  const [getError, setGetError] = useState("");
  const [delError, setDelError] = useState("");
  const [addError, setAddError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [newName, setNewName] = useState("");
  const [input, setInput] = useState("");
  const [defaultList, setDefaultList] = useState([]);
  const [errorList, setErrorList] = useState([]);
  const [updateErrorList, setUpdateErrorList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  const [searchInput, setSearchInput] = useState("");
  const [searchList, setSearchList] = useState([]);

  const [newMaritalStatus, setNewMaritalStatus] = useState("1");
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const getDetails = Axios.get("http://localhost:3001/api/details");
      const getStatus = Axios.get("http://localhost:3001/api/status");
      Axios.all([getDetails, getStatus]).then(
        Axios.spread((...responses) => {
          let merged = [];
          for (let i = 0; i < responses[0].data.length; i++) {
            merged.push({
              ...responses[0].data[i],
              ...responses[1].data.find(
                (item) =>
                  item.maritalStatusId === responses[0].data[i].maritalStatusId
              ),
            });
          }
          setList(merged);
          setDefaultList(merged);
        })
      );
    };
    fetchData();
  }, []);

  //serverside filtering data
  // useEffect(()=>{
  //   Axios.get("http://localhost:3001/api/details/status").then((response)=>{
  //     setList(response.data);
  //     setDefaultList(response.data);
  //   });
  // },[]);



  //get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = list.slice(indexOfFirstItem, indexOfLastItem);
  const SearchCurrentItems = defaultList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const serverItems = searchList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = (e) => {
    
    const maritalStatusId = +maritalStatus;
    Axios.post("http://localhost:3001/api/create", {
      name,
      age,
      maritalStatusId,
    })
      .then((response) => {
        window.location.reload(false);
        // setList([...list, { name, age, addStatus }]);
        // e.preventDefault();
        // setName("");
        // setAge("");
      })
      .catch((err) => {
        e.preventDefault();
        setAddError(err.message);
      });
  };

  const deleteItem = (id) => {
    Axios.delete(`http://localhost:3001/api/delete/${id}`)
      .then((response) => {
        setList(
          list.filter((item) => {
            return item.id !== id;
          })
        );
      })
      .catch((err) => {
        setErrorList(
          list.filter((item) => {
            return item.id === id;
          })
        );
        setDelError(err.message);
      });
  };

  const updateDetails = (id) => {
    
    const newMaritalStatusId = +newMaritalStatus;
    Axios.put("http://localhost:3001/api/update", {
      name: newName,
      age: newAge,
      id: id,
      maritalStatusId: newMaritalStatusId,
    })
      .then((response) => {
        window.location.reload(false);
        // setList(
        //   list.map((item) => {
        //     return item.id === id
        //       ? {
        //           id: item.id,
        //           name: newName,
        //           age: newAge,
        //           maritalStatusId: item.maritalStatusId,
        //         }
        //       : item;
        //   })
        // );
      })
      .catch((err) => {
        setUpdateErrorList(
          list.filter((item) => {
            return item.id === id;
          })
        );
        setUpdateError(err.message);
      });
  };

  const dynamicSearch = (e) => {
    setInput(e.target.value);
    paginate(1);
    setDefaultList(
      list.filter((item) => {
        return item.name.toLowerCase().startsWith(e.target.value.toLowerCase());
      })
    );
  };

  const handleSearch = (searchInput) => {
    Axios.get(`http://localhost:3001/api/search/${searchInput}`)
      .then((response) => {
        setSearchList(response.data);
      })
      .catch((err) => {
        setGetError(err.message);
      });
  };

  return (
    <div className="App">
      <h1>CRUD</h1>
      <div className="form">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="age">Age:</label>
        <input
          type="text"
          id="age"
          name="age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <br></br>
        <h6>Marital status :</h6>
        <select onChange={(e) => setMaritalStatus(e.target.value)}>
          <option value="1">Single</option>
          <option value="2">Married</option>
          <option value="3">Widowed</option>
          <option value="4">Divorced</option>
        </select>
        <br></br>
        <button type="submit" onClick={handleSubmit}>
          Add
        </button>
      </div>
      <br></br>

      <input
        type="search"
        value={input}
        placeholder="search name..."
        onChange={(e) => dynamicSearch(e)}
        className="searchBar"
      />
      <br></br>
      <br></br>

      <input
        type="search"
        value={searchInput}
        placeholder="search name in database..."
        onChange={(e) => {
          setSearchInput(e.target.value);
          setSearchList([]);
          paginate(1);
        }}
        className="searchBar"
      />
      <button type="button" onClick={() => handleSearch(searchInput)}>
        Search
      </button>

      {addError && (
        <div>
          <h3>{addError}</h3>
          <h2>Unable to add details</h2>
        </div>
      )}
      <h2>Student Details</h2>
      {getError && (
        <div>
          <h3>{getError}</h3>
          <h2>Unable to get details</h2>
        </div>
      )}

      {delError && (
        <div>
          <h3>{delError}</h3>
          <h2>Unable to delete {errorList[0].name}</h2>
        </div>
      )}

      {updateError && (
        <div>
          <h3>{updateError}</h3>
          <h2>Unable to update details of {updateErrorList[0].name}</h2>
        </div>
      )}

      {input &&
        SearchCurrentItems.map(({ id, name, age, statusName }) => {
         
          return (
            <div key={id} className="list">
              <h3>
                {name} | {age} | {statusName}
              </h3>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="text" onChange={(e) => setNewAge(e.target.value)} />
              <select  onChange={(e) => setNewMaritalStatus(e.target.value)}>
                <option value="1">Single</option>
                <option value="2">Married</option>
                <option value="3">Widowed</option>
                <option value="4">Divorced</option>
              </select>
              <button type="button" className="editButton" onClick={() => updateDetails(id)}>
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteItem(id);
                }}
              >
                Delete
              </button>
            </div>
          );
        })}

      {input && (
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={defaultList.length}
          paginate={paginate}
        />
      )}

      {!input &&
        !searchInput &&
        currentItems.map(({ id, name, age, statusName,maritalStatusId }) => {
          
          return (
            <div key={id} className="list">
              <h3>
                {name} | {age} | {statusName}
              </h3>
              <input type="text"  value={name} onChange={(e) => setNewName(e.target.value)} />
              <input type="text" defaultValue={age} onChange={(e) => setNewAge(e.target.value)} />
              <select defaultValue={maritalStatusId+""} onChange={(e) => setNewMaritalStatus(e.target.value)}>
                <option value="1">Single</option>
                <option value="2">Married</option>
                <option value="3">Widowed</option>
                <option value="4">Divorced</option>
              </select>
              <button type="button" className="editButton" onClick={() => updateDetails(id)}>
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteItem(id);
                }}
              >
                Delete
              </button>
            </div>
          );
        })}

      {!input && !searchInput && (
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={list.length}
          paginate={paginate}
        />
      )}

      {searchInput &&
        serverItems.map(({ id, name, age, statusName }) => {
          return (
            <div key={id} className="list">
              <h3>
                {name} | {age} | {statusName}
              </h3>
              <input type="text" onChange={(e) => setNewName(e.target.value)} />
              <input type="text" onChange={(e) => setNewAge(e.target.value)} />
              <select onChange={(e) => setNewMaritalStatus(e.target.value)}>
                <option value="0"></option>
                <option value="1">Single</option>
                <option value="2">Married</option>
                <option value="3">Widowed</option>
                <option value="4">Divorced</option>
              </select>
              <button type="button" className="editButton" onClick={() => updateDetails(id)}>
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteItem(id);
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      {searchInput && (
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={searchList.length}
          paginate={paginate}
        />
      )}
    </div>
  );
}

export default App;

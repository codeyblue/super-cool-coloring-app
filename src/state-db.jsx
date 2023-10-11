import React, { createContext, useContext, useEffect } from 'react';
import setupIndexedDB, { useIndexedDBStore } from 'use-indexeddb';

const DB = createContext();
DB.displayName = 'DBContext';

// Database Configuration
const idbConfig = {
  databaseName: 'app-state',
  version: 1,
  stores: [{
    name: "keystore",
    id: { keyPath: "name", autoIncrement: false },
    indices: [
      { name: "name", keyPath: "name", options: { unique: true } },
    ],
  }]
};

export const withDB = Component => ({ children, ...props }) => {
  useEffect(() => {
    setupIndexedDB(idbConfig).then(() => {
      console.log('database is initailized');
    }).catch(err => {
      console.error('database failed to initialize:', err);
    });
  });

  const { update, getOneByKey, deleteAll } = useIndexedDBStore('keystore');

  const set = (name, value) => update({ name, value });
  const get = name => getOneByKey('name', name).then(result => {
    if (result) {
      return result.value;
    }

    return undefined;
  });
  const reset = () => deleteAll();

  return (
    <DB.Provider value={{
      set,
      get,
      reset
    }}>
      <Component {...props}>{children}</Component>
    </DB.Provider>
  )
};

export const useDB = () => useContext(DB);

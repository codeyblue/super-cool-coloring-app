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

  const { update, getOneByKey, deleteAll, openCursor } = useIndexedDBStore('keystore');

  const set = (name, value) => update({ name, value });
  const get = name => getOneByKey('name', name).then(result => {
    if (result) {
      return result.value;
    }

    return undefined;
  });
  const reset = () => deleteAll();

  const find = (matcher = () => false) => new Promise((resolve, reject) => {
    const result = [];

    openCursor(e => {
      const c = e.target.result;

      if (c) {
        if (matcher(c.value)) {
          result.push(c.value);
        }

        c.continue();
      } else {
        resolve(result);
      }
    });
  });
  return (
    <DB.Provider value={{
      set,
      get,
      reset,
      find
    }}>
      <Component {...props}>{children}</Component>
    </DB.Provider>
  )
};

export const useDB = () => useContext(DB);

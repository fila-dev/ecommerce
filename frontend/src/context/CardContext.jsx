import React, { createContext, useReducer } from "react";

export const CardsContext = createContext();

export const cardsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CARDS':
            return {
                ...state,
                cards: action.payload,
            };
        case 'CREATE_CARD':
            return {
                ...state,
                cards: [action.payload, ...state.cards],
            };
        case 'DELETE_CARD':
            return {
        cards: state.cards.filter((w) =>w.id !== action.payload._id)
            }    
        default:
            return state;
    }
};

export const CardsContextProvider = ({ children }) => {
    const initialState = {
        cards: [],
    };

    const [state, dispatch] = useReducer(cardsReducer, initialState);

    return (
        <CardsContext.Provider value={{ ...state, dispatch }}>
            {children}
        </CardsContext.Provider>
    );
};
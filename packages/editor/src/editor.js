import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import store from 'netlify-cms-core/src/redux';
import {
  loadEntry,
  loadEntries,
  createDraftFromEntry,
  createEmptyDraft,
  discardDraft,
  changeDraftField,
  changeDraftFieldValidation,
  persistEntry,
  deleteEntry,
} from 'netlify-cms-core/src/actions/entries';
// import { createNewEntry } from 'netlify-cms-core/src/actions/collections';

const IDENTIFIER = 'identifier';
const SELECTOR = '[data-' + IDENTIFIER + ']';

export default class Editor {

	saveData(id, data) {
		var app = this;
	    return new Promise( resolve => {
	        setTimeout( () => {
	            console.log( 'Saved ' + id, data );
	            const collection = app.getCollectionByName(id.collection);
	            console.log(collection)

	            if (!id.slug) {
			      store.dispatch(createEmptyDraft(collection));
			    } else {
			      store.dispatch(loadEntry(collection, id.slug));
			    }
			    store.dispatch(changeDraftField(id.field, data, null));

	            store.dispatch(persistEntry(collection));

	            resolve();
	        }, 1 );
	    } );
	}

	getIdentifier(el) {
		var id = {};
		if(el && el.dataset) {
			console.log(el.dataset[IDENTIFIER])
			id = JSON.parse(el.dataset[IDENTIFIER]);
		}
	  	return id;
	}

	initEditor() {
		console.log("initEditor")
	  	let elements = document.querySelectorAll( SELECTOR );
	  	for (var i = 0; i < elements.length; ++i) {

	  		let id = this.getIdentifier(elements[i]);
	  		console.log("identifier", id)
	  		if(!id.collection || !id.field) continue;

		    InlineEditor
		    .create( elements[i])
		    .then( editor => {
				(window.editors = window.editors || []).push(editor);

				// editor.model.document.on( 'change:data', () => {
				// 	console.log( 'The data has changed!' );
				// } );

			  	editor.ui.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
				    if ( !isFocused ) {
				    	console.log( 'Blur editor' );
				        this.saveData( id, editor.getData() );
				    }
				});

		      	console.log( 'Editor was initialized', editor );

		    } )
		    .catch( err => {
		      console.error( err.stack );
		    } );
	  	}
	}

	getCollectionByName(name) {
		store.getState().collections.get(name);
	}

	constructor() {
		this.store = store;
		this.initEditor();
	}
}
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import store from 'Redux';
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
} from 'Actions/entries';

const COLLECTION = 'collection';
const SLUG = 'slug';
const FIELD = 'field';
const NEW_ENTRY = 'new';
const EDITABLE = FIELD;

export default class Editor {

	getEntryData(el) {
		var entryData = {};
		if(el && el.dataset) {
			entryData.collection = el.dataset[COLLECTION];
			entryData.slug = el.dataset[SLUG];
			entryData.newEntry = el.dataset[NEW_ENTRY];
		}
	  	return entryData;
	}

	getField(el) {
		if(el && el.dataset) {
			return el.dataset[FIELD];
		}
	}

	isEditable(el) {
		if(el && el.dataset) {
	  		return el.dataset[EDITABLE];
	  	}
	}

	getElements(identifier, baseElement = null) {
		return (baseElement || document).querySelectorAll( '[data-' + identifier + ']' );
	};

	initEditor() {
		console.log("initEditor")
	  	let elements = this.getElements( COLLECTION );
	  	console.log(elements)
	  	for (var i = 0; i < elements.length; ++i) {
	  		console.log("loop i" + i)

	  		let entryData = this.getEntryData(elements[i]);
	  		console.log("identifier", entryData)
	  		if(!entryData.collection || !entryData.slug) continue;
	  		this.entries[entryData.slug] = this.entries[entryData.slug] || entryData;

	  		let editables;
	  		if(this.isEditable(elements[i])) {
	  			editables = [ elements[i] ];
	  		} else {
	  			editables = this.getElements( EDITABLE, elements[i] );
	  		}

	  		for (var j = 0; j < editables.length; j++) {
	  			let field = this.getField(editables[j]);
	  			if(!field) continue;
			    InlineEditor
			    .create( editables[j])
			    .then( editor => {
			    	editor.field = field;
			    	editor.entry = entryData.slug;
			    	if(!entryData.newEntry) editor.savedData = editor.getData();
			    	else editor.savedData = '';
					(window.editors = window.editors || []).push(editor);

				  	editor.ui.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
					    if ( !isFocused ) {
					        this.saveData( editor );
					    }
					});

			      	console.log( 'Editor was initialized', editor );

			    } )
			    .catch( err => {
			      console.error( err.stack );
			    } );
			}
	  	}
	}

	getCollectionByName(name) {
		return store.getState().collections.get(name);
	}

	saveData(editor) {
		var app = this;
		var data = editor.getData();
		var entryData = this.entries[editor.entry];
		let isString = typeof data === 'string' || data instanceof String;
	    if(isString && editor.savedData.localeCompare(data)) {

            console.log( 'Saving ' + editor.field );
            const collection = app.getCollectionByName(entryData.collection);
            console.log(collection)

            if (entryData.newEntry) {
            	console.log("newEntry")
		      	store.dispatch(createEmptyDraft(collection));
		    } else {
		    	console.log("load")
	      		store.dispatch(loadEntry(collection, entryData.slug));
		    }
		    store.dispatch(changeDraftField('title', entryData.slug, null));
		    store.dispatch(changeDraftField(editor.field, data, null));

            store.dispatch(persistEntry(collection));
            editor.savedData = data;
            entryData.newEntry = false;
        }

	}

	constructor() {
		this.store = store;
		this.entries = {};

		this.initEditor();
	}
}
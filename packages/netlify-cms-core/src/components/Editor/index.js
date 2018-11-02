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
const NEW = 'new';
const EDITABLE = FIELD;

export default class Editor {

	getIdentifier(el) {
		var id = {};
		if(el && el.dataset) {
			id.collection = el.dataset[COLLECTION];
			id.slug = el.dataset[SLUG];
			id.new = el.dataset[NEW];
		}
	  	return id;
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
	  	for (var i = 0; i < elements.length; ++i) {

	  		let id = this.getIdentifier(elements[i]);
	  		console.log("identifier", id)
	  		if(!id.collection) continue;

	  		let editables;
	  		if(this.isEditable(elements[i])) {
	  			editables = [ elements[i] ];
	  		} else {
	  			editables = this.getElements( EDITABLE, elements[i] );
	  		}

	  		for (var i = 0; i < editables.length; i++) {
	  			let field = this.getField(editables[i]);
	  			if(!field) continue;
			    InlineEditor
			    .create( editables[i])
			    .then( editor => {
			    	editor.field = field;
			    	editor.collection = id.collection;
			    	editor.slug = id.slug;
			    	editor.new = id.new;
			    	editor.savedData = editor.getData();
					(window.editors = window.editors || []).push(editor);

					// editor.model.document.on( 'change:data', () => {
					// 	console.log( 'The data has changed!' );
					// } );

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
		let isString = typeof data === 'string' || data instanceof String;
	    if(isString && ( editor.new || editor.savedData.localeCompare(data) )) {

            console.log( 'Saving ' + editor.field );
            const collection = app.getCollectionByName(editor.collection);
            console.log(collection)

            if (editor.new) {
            	console.log("new")
		      	store.dispatch(createEmptyDraft(collection));
		    } else {
		    	console.log("load")
	      		store.dispatch(loadEntry(collection, editor.slug));
		    }
		    store.dispatch(changeDraftField('title', editor.slug, null));
		    store.dispatch(changeDraftField(editor.field, data, null));

            store.dispatch(persistEntry(collection));
            editor.new = false;
        }

	}

	constructor() {
		this.store = store;
		this.initEditor();
	}
}
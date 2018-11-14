import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import store from 'Redux';
import {
  loadEntry,
  createDraftFromEntry,
  createEmptyDraft,
  discardDraft,
  changeDraftField,
  persistEntry,
  deleteEntry,
} from 'Actions/entries';

const COLLECTION = 'collection';
const SLUG = 'slug';
const FIELD = 'field';
const SAVED = 'saved';
const EDITABLE = FIELD;

export default class Editor {

	getEntryData(el) {
		var entryData = {};
		if(el && el.dataset) {
			entryData.element = el;
			entryData.collection = el.dataset[COLLECTION];
			entryData.slug = el.dataset[SLUG];
			entryData.saved = el.dataset[SAVED];
			if(el.dataset[EDITABLE]) entryData.field = el.dataset[FIELD];
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
	  		if(entryData.field) {
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
			    	if(entryData.saved) editor.savedData = editor.getData();
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

	getUser(name) {
		return store.getState().auth.get('user');
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

            if (entryData.saved) {
            	console.log("loaing entry..")
	      		store.dispatch(loadEntry(collection, entryData.slug));
		    } else {
	      		console.log("creating new entry..")
		      	store.dispatch(createEmptyDraft(collection));
		      	store.dispatch(changeDraftField('title', entryData.slug, null));
		    }

		    store.dispatch(changeDraftField(editor.field, data, null));

            store.dispatch(persistEntry(collection));
            editor.savedData = data;
            entryData.saved = true;
            console.log("Saved entry.")
        }

	}

	constructor() {
		// const { collections, entryDraft, auth, config, entries } = state;
		// const slug = ownProps.match.params.slug;
		// const collection = collections.get(ownProps.match.params.name);
		// const collectionName = collection.get('name');
		// const saved = ownProps.newRecord === false;
		// const fields = selectFields(collection, slug);
		// const entry = saved ? null : selectEntry(state, collectionName, slug);
		// const boundGetAsset = getAsset.bind(null, state);
		// this.user = auth && auth.get('user');
		// const hasChanged = entryDraft.get('hasChanged');
		// const displayUrl = config.get('display_url');
		// const hasWorkflow = config.get('publish_mode') === EDITORIAL_WORKFLOW;
		// const isModification = entryDraft.getIn(['entry', 'isModification']);
		// const collectionEntriesLoaded = !!entries.getIn(['entities', collectionName]);
		// const unpublishedEntry = selectUnpublishedEntry(state, collectionName, slug);
		// const currentStatus = unpublishedEntry && unpublishedEntry.getIn(['metaData', 'status']);

		// this.store = store;

		if (this.getUser() == null) {
	      return;
	    }

		if(!window.editors) {
			this.entries = {};
			this.initEditor();
		}
	}
}
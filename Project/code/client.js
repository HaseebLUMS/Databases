const socket = io()
const state = {}

/*
socket.emit(data, 'data')
socket.on('data', data => {
})
*/
mainMenu = a =>{
	console.log('Client Initializing')
	socket.emit('init', 'init_data');
}
mainMenu();


socket.on('init', result => {
	console.log(result[0]['Tables_in_PSMS']);
	ReactDOM.render(
		React.createElement(
			'Table',
			{
				style:{border: '5px solid black',padding: '15px'}
			},
			result.map(r => 
				React.createElement('tr', null, 
					React.createElement('td', 
						{
							style:{border: '1px solid black',padding: '15px'},
						},
						//making a div with edit icon and r[....]
						React.createElement('div', {id:'AlignDiv'},
							React.createElement('div', 
								{id: 'AlignDiv1',onClick: ev =>{console.log('requesting show');socket.emit('show', r['Tables_in_PSMS']);}}, 
								r['Tables_in_PSMS']),
							React.createElement('div', 
								{id: 'AlignDiv2',onClick: ev => {console.log(`Requesting Edit for ${r['Tables_in_PSMS']}`);socket.emit('edit', r['Tables_in_PSMS']);}}, 
								React.createElement('img', {src : './EditIcon.png'})),
						)
					)
				),
			),
			React.createElement('tr', null,
				React.createElement('td',
						{
							style:{border: '1px solid black',padding: '15px'},
							onClick: ev =>{socket.emit('queries', 'queries');console.log('Queries Requested');},
						},
						'Queries'
					)
			)
		),
		document.getElementById('db')
	);

	ReactDOM.render(
		React.createElement('img', {id:'logo', src:'./logo.png'})
		,document.getElementById('root'))
});


socket.on('show', result => {
	keys = Object.keys(result[0])

	fake_result = {};
	for(i = 0; i< keys.length; i++) {
		fake_result[keys[i]] = keys[i];
	}
	result = [fake_result, ...result];


	ReactDOM.render(
		React.createElement('div', {id:'block'},
			React.createElement('Table', {style:{border: '2px solid black',padding: '1px'}},
				//header row
				React.createElement('tr', {style:{border: '1px solid black',padding: '10px'}},
					keys.map(k => {
						React.createElement('td',{style:{border: '1px solid black',padding: '10px'}}, 'ye')
					})
				),
				//data rows
				result.map(r =>
					React.createElement('tr', {style:{border: '1px solid black',padding: '10px'}},
						keys.map(k => 
							React.createElement('td', {style:{border: '1px solid black',padding: '10px'}}, r[k])
						)
					),
				
			)),
		),
		document.getElementById('root')
	);
});



idealData = []
editData = {} //used by socket on edit and presubmit
updateData = {} //used by socket on edit and preUpdate
itemToDelete = 1


preSubmit = os => {
	os.preventDefault();
	console.log('edit data', editData);
	/*Check for editData validity*/
	/*alert('Constraints Error');*/
	
	socket.emit('editData', editData);
}


preDelete = oc => {
	oc.preventDefault();
	console.log('Deleting ', itemToDelete);
	socket.emit('deleteData', itemToDelete);
}


preUpdate = oc => {
	oc.preventDefault();
	console.log('Updating', updateData[Object.keys(updateData)[0]]);
	socket.emit('updateData', updateData);
}




socket.on('edit', dataResult => {
	/*dataResult => {result, tableData, tableName}*/
	/*data => [{},{},{},....]*/

	data = dataResult['result']
	result = dataResult['tableData']


	idealData = data;
	alertString = 'Valid Format: \n\n';
	idealData.forEach(i => {
		alertString += (i['Field'] + ' ' + i['Type'] + '\n')
	})
	//alert(alertString); Delaying until data on the page is rendered is show
	editData = {};
	updateData = {};

	keys = Object.keys(result[0])
	fake_result = {};
	for(i = 0; i< keys.length; i++) {
		fake_result[keys[i]] = keys[i];
	}
	result = [fake_result, ...result];
	console.log('editing now', data);


	ReactDOM.render(
		React.createElement('div', {id: 'block'},
			

			/*Delete*/
			React.createElement('form',{onSubmit: preDelete},
				React.createElement('input', {onChange: oc => itemToDelete = oc.target.value, placeholder: 'Enter ID for removing data.'}),
				React.createElement('input', {type: 'submit', value: 'Delete'})
			),

			
			//Add
			React.createElement('form',{onSubmit: preSubmit},
				data.map(d => React.createElement('input', {type: 'text', style:{width:"100px"},placeholder: d['Field'],onChange: oc => editData[d['Field']] = oc.target.value})),
				React.createElement('input', {type: 'submit', value: 'Add'})
			),


			//Update
			React.createElement('form',{onSubmit: preUpdate},
				data.map(d => React.createElement('input', {type: 'text', style:{width:"100px"},placeholder: d['Field'],onChange: oc => updateData[d['Field']] = oc.target.value})),
				React.createElement('input', {type: 'submit', value: 'Update'})
			),




			//Data
			React.createElement('Table', {style:{border: '2px solid black',padding: '1px'}},
				//header row
				React.createElement('tr', {style:{border: '1px solid black',padding: '10px'}},
					keys.map(k => {
						React.createElement('td',{style:{border: '1px solid black',padding: '10px'}}, 'ye')
					})
				),
				//data rows
				result.map(r =>
					React.createElement('tr', {style:{border: '1px solid black',padding: '10px'}},
						keys.map(k => 
							React.createElement('td', {style:{border: '1px solid black',padding: '10px'}}, r[k])
						)
					),
				)
			),


			

		)
		,document.getElementById('root')
	);
	alert(`${alertString}\n`);
});

socket.on('queries', data => {
	console.log('data of queroes', data);
	ReactDOM.render(
		React.createElement(
			'Table',
			{
				style:{border: '5px solid black',padding: '15px'}
			},
			data.map(r => 
				React.createElement('tr', null, 
					React.createElement('td', 
						{
							style:{border: '1px solid black',padding: '15px'},
							onClick: ev =>{console.log('requesting query processing');socket.emit('processQuery', r[0]);}
						},
						`${r[0]} => ${r[1]}`
					)
				),
			),
			React.createElement('tr', null,
				React.createElement('td',
						{
							style:{border: '1px solid black',padding: '15px'},
							onClick: ev =>{socket.emit('init2', 'init_data');console.log('Table Names Requested');},
						},
						'Tables'
				)
			)
		),
		document.getElementById('db')
	);


});


socket.on('var', data =>{
	variable = 0;
	ReactDOM.render(
		React.createElement('form', null,
			React.createElement('input', {placeholder: data[0], onChange: oc => variable = oc.target.value}, null),
			React.createElement('button', {onClick: oc => {oc.preventDefault();socket.emit('var', [variable,data[1]])}}, 'Submit')
		)
		,document.getElementById('root')
	)
})











socket.on('editDone', data => {
	console.log('Edited', data);
	//window.location.reload();
	socket.emit('show', data);
});

socket.on('deleteDone', data => {
	console.log('Deleted from ' ,data);
	socket.emit('show', data);
});

socket.on('updateDone', data => {
	console.log('Updated in ', data);
	socket.emit('show', data);
})



socket.on('editFailed', data => {
	alert(`editing the relation ${data} failed.`);
	socket.emit('edit', data);
});


socket.on('deleteFailed', data => {
	alert(`deleting the data from ${data} failed.`);
	socket.emit('edit', data);
});


socket.on('updateFailed', data => {
	alert('Update operation cannot be made\nPlease comply to requirements.\n');
	socket.emit('edit', data);
})
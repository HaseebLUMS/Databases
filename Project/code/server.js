const fs = require('fs')
const http = require('http')
const mysql = require('mysql');
const socketio = require('socket.io')
var underEditRelation = ''
var UERID = ''

variables = {
	Query3: 'date (format: 20181231 (first 4 digits = year, then 2 dig for mon and last 2 for date))',
	Query6: 'Customer ID(format: 1)', 
	Query7: 'Sale ID(format: 1)', 
	Query8a: 'Supplier ID(format: 1)', 
	Query8b: 'Supplier ID(format: 1)', 
	Query9: 'Price Range(format: 10-30)', 
	Query10a: 'Food ID', 
	Query10b: 'Food ID' 
}

mend = {
	Query3: 164,
	Query6: 256,
	Query7: 500,
	Query8a: 98,
	Query8b: 188,
	Query9i: 49,
	Query9ii: 66,
	Query10a: 115,
	Query10b: 430
}
queriesDict = {
	Query1: "SELECT pet_type, COUNT(pet_type) AS total_sales FROM (SELECT * FROM sale_main LEFT JOIN pets_main ON sale_main.product_id = pets_main.pet_id) as JT GROUP BY pet_type ORDER BY COUNT(pet_type) DESC LIMIT 1;",
	Query2: "SELECT stp.supplier_id, COUNT(stp.supplier_id) AS total_sales FROM supplier_to_prodcut as stp GROUP BY stp.supplier_id ORDER BY COUNT(stp.supplier_id) DESC LIMIT 1;",
	Query3: "SELECT SUM(pet_price) as Revenue, sale_date FROM (SELECT * FROM sale_main LEFT JOIN pets_main ON sale_main.product_id = pets_main.pet_id) as RESD WHERE sale_date = ;",
	Query4: "SELECT cm.customer_id, cm.customer_name, cm.customer_city, cm.customer_street, RESD.total_amount_of_purchases FROM customer_main as cm RIGHT JOIN (SELECT customer_id as customer, SUM(pet_price) as total_amount_of_purchases FROM sale_main as sm LEFT JOIN pets_main as pm ON sm.product_id = pm.pet_id GROUP BY customer_id ORDER BY SUM(pet_price) DESC LIMIT 1) as RESD ON cm.customer_id = RESD.customer;",
	Query5: "SELECT fm.food_name as leastEatenFoodName, (fm.food_id) as leastEatenFoodID FROM food_main as fm LEFT JOIN pet_to_food as ptf ON fm.food_id = ptf.food_id GROUP BY fm.food_id ORDER BY COUNT(fm.food_id) LIMIT 1;",
	Query6: "SELECT RESD.customer_id, RESD.sale_id, RESD.pet_id, RESD.pet_name, RESD.pet_type, RESD.pet_price, RESD.sale_date, RESD.employee_id FROM (SELECT * FROM sale_main as sm LEFT JOIN pets_main as pm ON sm.product_id = pm.pet_id) as RESD WHERE RESD.customer_id = ;",
	Query7: "SELECT pet_details.PID as ID, pet_details.PN as NAME, pet_details.PT as Type, pet_details.PB as Breed, pet_details.PG as Gender, pet_details.PSize as Size, pet_details.PP as Price FROM sale_main as sm LEFT JOIN (SELECT pm.pet_id as PID, pm.pet_name as PN, pm.pet_type as PT, ps.pet_breed as PB, ps.pet_gender as PG, ps.pet_size as PSize, pm.pet_price as PP FROM pets_main as pm LEFT JOIN pets_specs as ps ON pm.pet_id = ps.pet_id) as pet_details ON sm.product_id = pet_details.PID WHERE sm.sale_id = ;",
	Query8a: "SELECT COUNT(product_id) as TOTAL_SALES, supplier_id FROM supplier_to_prodcut WHERE supplier_id =  ORDER BY COUNT(product_id);",
	Query8b: "SELECT stp.supplier_id as SUPPLIER, pm.pet_name as NAME, pm.pet_type TYPE FROM (supplier_to_prodcut as stp LEFT JOIN pets_main as pm ON stp.product_id = pm.pet_id) WHERE stp.supplier_id = ;",
	Query9: "SELECT pet_name FROM pets_main WHERE pet_price >  AND pet_price < ;",
	Query10a: "SELECT COUNT(RESD.PET) FROM (SELECT ptf.pet_id as PET, ptf.food_id as FOOD FROM pet_to_food as ptf WHERE food_id = ) as RESD;",
	Query10b: "SELECT pet_details.PID, pet_details.PT, pet_details.PB, pet_details.PG, pet_details.PSize, pet_details.PP FROM pet_to_food as gptf LEFT JOIN (SELECT pm.pet_id as PID, pm.pet_name as PN, pm.pet_type as PT, ps.pet_breed as PB, ps.pet_gender as PG, ps.pet_size as PSize, pm.pet_price as PP FROM pets_main as pm LEFT JOIN pets_specs as ps ON pm.pet_id = ps.pet_id) as pet_details ON gptf.pet_id = pet_details.PID WHERE gptf.food_id = ",
}


const readFile = f => new Promise((resolve, reject) =>{

	
	fs.readFile(f, (e,d) => e? reject(e): resolve(d))
})

const server = http.createServer(async (req,resp) =>{
	d = await readFile(req.url.substr(1))
	resp.end(d)
})






newConnection = socketio(server)
newConnection.sockets.on('connection', socket =>{
	console.log('user entered for querying')
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
	  	password: "PaSwOrD4linux"
	});



	socket.on('init', data =>{
		console.log('Server Initializing...')
		con.connect(function(err) {
			if (err) throw err;
			console.log('...');
			console.log("Connected to PSMS (Pet Store Management System).");



			/*Queries Ahead.*/
			con.query('USE PSMS;', function(err, result) {
				if (err) throw err;
		  	});




			total_relations = 0;
			con.query('SHOW TABLES;', function(err, result) {
				console.log(result);
				socket.emit('init', result);

			});


			socket.on('init2', data=>{
				con.query('SHOW TABLES;', function(err, result) {
					console.log(result);
					socket.emit('init', result);
				});

			})


			socket.on('show', data => {
				q = `SELECT * FROM ${data}`
				console.log('show=>', q);
				con.query(q, function(err, result) {
					if(!err){
						console.log('showing',result);socket.emit('show', result);
					}
					else throw err;
				});

			});


			socket.on('edit', data => {
				underEditRelation = data;
				dataResult = {}
				q = `describe ${data}`
				con.query(q, function(err, result) {
					if(!err){
						UERID = result[0]['Field']
						qq = `SELECT * FROM ${underEditRelation}`
						con.query(qq, function(er, res) {
							if(!err) {
								tableData = res;
								tableName = underEditRelation;

								dataResult['tableData'] = res;
								dataResult['tableName'] = underEditRelation;
								dataResult['result'] = result;

								console.log('\nresultData\n', dataResult);
								socket.emit('edit', dataResult);
							}
							else throw err;
						});
					}
					else throw err;
				});

			});


			socket.on('editData', data => {
				dataKeys = Object.keys(data);
				str = '';
				dataKeys.forEach(d => {
					str += `'${data[d]}',`
				})
				str = str.substr(0, str.length-1);
				q = `INSERT INTO ${underEditRelation} VALUE (${str});`
				con.query(q, function(err, result) {
					if(!err) {console.log('\nEdited\n');console.log(result);}
					else {socket.emit('editFailed', underEditRelation)};
				})
				console.log('Successfully edited', underEditRelation);
				socket.emit('editDone', underEditRelation);

			});


			socket.on('deleteData', data => {
				q = `DELETE FROM ${underEditRelation} WHERE ${UERID} = ${data};`
				con.query(q, function(err, result) {
					if(!err) {console.log('Deleted Successfully', data, 'FROM', underEditRelation);socket.emit('deleteDone', underEditRelation);}
					else {socket.emit('deleteFailed', underEditRelation);}
				})
		
			});


			socket.on('updateData', data=> {
				//First extracting ID
				ID = data[Object.keys(data)[0]]

				//now first deleting the respective data
				q = `DELETE FROM ${underEditRelation} WHERE ${UERID} = ${ID};`
				con.query(q, function(err, result) {
					if(!err) {
						console.log('Delete4Update Successfully', data, 'FROM', underEditRelation);
						socket.emit('deleteDone', underEditRelation);


						dataKeys = Object.keys(data);
						str = '';
						dataKeys.forEach(d => {
							str += `'${data[d]}',`
						})
						str = str.substr(0, str.length-1);
						q = `INSERT INTO ${underEditRelation} VALUE (${str});`
						con.query(q, function(err, result) {
							if(!err) {
								console.log('\nUpdates\n');console.log(result);
								socket.emit('UpdateDone', underEditRelation);
							}
							else {socket.emit('UpdateFailed', underEditRelation)};
						})



					}
					else {socket.emit('updateFailed', underEditRelation);}
				})

			});


			socket.on('queries', data =>{
				queries = 
				[
					['Query1', 'Maximum Sold Pet'], 
					['Query2', 'Supplier with Max sales'], 
					['Query3', 'Revenue of a particular day'], 
					['Query4', 'Customer with max amount of purchases'], 
					['Query5', 'Hardly Eaten Food'], 
					['Query6', 'Order History of a customer'], 
					['Query7', 'Detail of sold pet in a particular order'], 
					['Query8a', 'Number of Sales by particular supplier'], 
					['Query8b', 'names of pets sold by particular supplier'], 
					['Query9', 'Pets withing a range of price'], 
					['Query10a', 'number who eat a particular food'],
					['Query10b', 'details of pets who eat a particular food']
				];

				console.log(queries);
				socket.emit('queries', queries);

			});

			socket.on('var', data => {
				q = data[1]
				variable = data[0]
				console.log('var', data)


				if(q != 'Query9'){
					breakpoint = mend[q]
					part1 = (queriesDict[q]).substr(0, breakpoint)
					part2 = (queriesDict[q]).substr(breakpoint)
					que = part1 + `${variable}` + part2

					console.log(que)
					con.query(que, function(err, result) {
						if(!err){console.log('processed',result);socket.emit('show', result);}else throw err;
					});
				} 

				else {
					ran = variable.split('-')
					from = ran[0]; to = ran[1]
					part1 = (queriesDict[q]).substr(0, mend[`Query9i`])
					part2 = (queriesDict[q]).substr(mend[`Query9i`], mend[`Query9ii`]-mend[`Query9i`]); part3 = ';'
					que = part1 + from + part2 + to + part3
					con.query(que, function(err, result) {
						if(!err){socket.emit('show', result);console.log('Processed', result)}
						else throw err;
					});
				}

			})

			socket.on('processQuery', data =>{
				if((data[data.length -1] - 0) > 5 || data == 'Query3' || data == 'Query8a' || data == 'Query8b' || data == 'Query10a' || data == 'Query10b'){
					quest = variables[data] || console.log("Error")
					socket.emit('var', [quest, data])
				}

				else{
					console.log('Processing', data);
					currentQuery = queriesDict[data]
					con.query(currentQuery, function(err, result) {
						if(!err){
							console.log('processed',result);socket.emit('show', result);
						}
						else throw err;
					});
				}

			})


		});//connect
	})
	
})
server.listen(12000, () => console.log('Started'))

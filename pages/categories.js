import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';

function Categories({swal}){
    const [edittedCategory, setEittedCategory] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [categories, setCategories] = useState('');
    const [properties, setProperties] = useState('');
    useEffect(() => {
        fetchCategories();
    }, [])
    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        });
    };
    async function saveCategory(ev){
        ev.preventDefault();
        const data = {
            name, 
            parentCategory, 
            properties:properties.map(p => ({
                name:p.name, values:p.values.split(',')
            }))
        }
        if (edittedCategory){
            data._id = edittedCategory._id;
            await axios.put('/api/categories', data);

        } else{
            
            await axios.post('/api/categories', data);
        }
        setName('');
        setParentCategory('');
        setEittedCategory(null);
        setProperties([]);
        fetchCategories();
    }
    function deleteCategory(category){
        swal.fire({
            title: 'Are you sure?',
            text: `Do you want do delete ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, Delete!',
            confirmButtonColor: '#d55',
            reverseButtons: true,
        }).then(async result => {
            // when confirmed and promise resolved...
            if(result.isConfirmed){
                const {_id} = category;
                await axios.delete('/api/categories?_id='+_id)
                fetchCategories();
            }
        })
    }
    function addProperty(){
        setProperties(prev => {
            return [...prev, {name:'', vlaues:''}];
        });
    }
    function editCategory(category){
        setEittedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(
            category.properties.map(({name, values}) => (
                {
                    name,
                    values:values.join(',')
                }
            )));
    };
    function handlePropertyNameChange(index, property, newName){
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        })
    };

    function handlePropertyValuesChange(index, property, newValues){
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        })
    };
    function removeProperty(indexToRemove){
        setProperties(prev => {
            return [...prev].filter((p, pIndex) => {
                return pIndex !== indexToRemove;
            });
        });
    };
    return(
        <Layout>
            <h1>Categories</h1>
            <label>{
            edittedCategory ? 
            `Edit category ${edittedCategory.name}` 
            : 'Create category name'
            }</label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                    <input 
                    type="text" 
                    placeholder={'Category Name'}
                    onChange={ev => setName(ev.target.value)} 
                    value={name} />
                    <select 
                    onChange={ev => setParentCategory(ev.target.value)} 
                    value={parentCategory}>
                        <option value="">No parent category</option>
                        {categories.length > 0 && categories.map(category => (
                            <option value={category._id}>{category.name}</option>
                            )
                        )}
                    </select>
                </div>
                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button 
                    onClick={addProperty}
                    type="button" className="btn-default text-sm mb-2">
                        Add New Property
                    </button>
                    {properties.length > 0 && properties.map((property, index) => (
                        <div className="flex gap-1 mb-2">
                            <input 
                            type="text" 
                            className="mb-0"
                            value={property.name}
                            onChange={ev => handlePropertyNameChange(index, property, ev.target.value)}
                            placeholder="Property name (e.g.: color" 
                            />
                            <input 
                            type="text" 
                            className="mb-0"
                            value={property.values}
                            onChange={ev => handlePropertyValuesChange(index, property, ev.target.value)}
                            placeholder="values, comma separated"
                            />
                            <button
                            onClick={() => removeProperty(index)} 
                            type="button" 
                            className="btn-default">
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                    {edittedCategory && (
                    <button 
                    type="button"
                    onClick={() => {
                        setEittedCategory(null);
                        setName('');
                        setParentCategory('');
                        setProperties([]);
                    }}
                    className="btn-default">Cancel</button>
                    )}
                    <button type="submit" className="btn-primary py-1">Save</button>
                </div>
            </form>
            {!edittedCategory && (
                <table className="basic mt-4">
                    <thead>
                        <tr>
                            <td>Category Name</td>
                            <td>Parent Category</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 && categories.map(category => (
                            <tr>
                                <td>{category.name}</td>
                                <td>{category?.parent?.name}</td>
                                <td>
                                    <button onClick={() => editCategory(category)}
                                    className="btn-primary mr-1">Edit</button>
                                    <button 
                                    onClick={() => deleteCategory(category)}
                                    className="btn-primary">Delete</button>
                                </td>
                            </tr>
                            )
                        )}
                    </tbody>
                </table>
            )}
        </Layout>
    )
}

export default withSwal(({swal}, ref) => (
    <Categories swal={swal} />
));
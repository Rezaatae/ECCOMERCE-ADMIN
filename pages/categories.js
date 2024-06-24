import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';

function Categories({swal}){
    const [edittedCategory, setEittedCategory] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [categories, setCategories] = useState('');
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
        const data = {name, parentCategory}
        if (edittedCategory){
            data._id = edittedCategory._id;
            await axios.put('/api/categories', data);

        } else{
            
            await axios.post('/api/categories', data);
        }
        setName('');
        setParentCategory('');
        setEittedCategory(null);
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
    function editCategory(category){
        setEittedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
    };
    return(
        <Layout>
            <h1>Categories</h1>
            <label>{
            edittedCategory ? 
            `Edit category ${edittedCategory.name}` 
            : 'Create category name'
            }</label>
            <form onSubmit={saveCategory} className="flex gap-1">
                <input 
                className="mb-0" 
                type="text" 
                placeholder={'Category Name'}
                onChange={ev => setName(ev.target.value)} 
                value={name} />
                <select className="mb-0" 
                onChange={ev => setParentCategory(ev.target.value)} 
                value={parentCategory}>
                    <option value="">No parent category</option>
                    {categories.length > 0 && categories.map(category => (
                        <option value={category._id}>{category.name}</option>
                        )
                    )}
                </select>
                <button type="submit" className="btn-primary py-1">Save</button>
            </form>
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
        </Layout>
    )
}

export default withSwal(({swal}, ref) => (
    <Categories swal={swal} />
));
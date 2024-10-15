// Fetch and display the details of a selected film by id
function fetchFilmDetails(id) {
    fetch(`http://localhost:3000/films/${id}`)
        .then(response => response.json())
        .then(data => {
            const { title, runtime, description, showtime, capacity, tickets_sold, poster } = data;

            document.getElementById('title').innerText = title;
            document.getElementById('runtime').innerText = `${runtime} minutes`;
            document.getElementById('film-info').innerText = description;
            document.getElementById('showtime').innerText = showtime;
            document.getElementById('ticket-num').innerText = `${capacity - tickets_sold} remaining tickets`;
            document.getElementById('poster').src = poster;
            document.getElementById('poster').alt = title

            const availableTickets = capacity - tickets_sold;

            const buyButton = document.getElementById('buy-ticket');

            // If the movie is sold out, disable the button and update its text
            if (availableTickets <= 0) {
                buyButton.disabled = true;
                buyButton.innerText = "Sold Out";
                document.getElementById('ticket-num').innerText = "Sold Out";
            } else {
                buyButton.disabled = false;
                buyButton.innerText = "Buy Ticket";
            }

            // Update the click handler for buying tickets
            buyButton.onclick = () => handleClick(id);
        })
        .catch(error => {
            console.error('Error fetching film details:', error);
        });
}

// Fetch all film titles and update the film list
function fetchFilmTitles() {
    fetch('http://localhost:3000/films/')
        .then(response => response.json())
        .then(data => {
            const ul = document.getElementById('films');
            ul.innerHTML = ''; // Clear previous list

            data.forEach(film => {
                const { id, title, capacity, tickets_sold } = film;

                const li = document.createElement('li');
                const liContent = document.createElement('span');
                const deleteButton = document.createElement('button');

                liContent.innerText = title;
                deleteButton.innerText = 'DELETE';

                // Append content and delete button to list item
                li.appendChild(liContent);
                li.appendChild(deleteButton);
                li.classList.add('film', 'item');

                // Check if the film is sold out and add the `sold-out` class
                if (capacity - tickets_sold <= 0) {
                    li.classList.add('sold-out');
                    deleteButton.disabled = true;
                }

                ul.appendChild(li);

                // Add event listener to fetch and display the selected film's details
                liContent.addEventListener('click', () => fetchFilmDetails(id));

                // Assign delete functionality to the delete button
                deleteButton.addEventListener('click', () => handleDelete(id));
            });
        })
        .catch(error => {
            console.error('Error fetching film titles:', error);
        });
}

// Handle the logic for reducing the number of available tickets when the button is clicked
function handleClick(id) {
    fetch(`http://localhost:3000/films/${id}`)
        .then(response => response.json())
        .then(data => {
            const { capacity, tickets_sold } = data;
            const availableTickets = capacity - tickets_sold;

            if (availableTickets > 0) {
                fetch(`http://localhost:3000/films/${id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        tickets_sold: tickets_sold + 1
                    })
                })
                    .then(() => {
                        fetch(`http://localhost:3000/tickets`, {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            },
                            body: JSON.stringify({
                                film_id: id,
                                number_of_tickets: 1
                            })
                        })
                            .then(response => response.json())
                            .then(ticketData => {
                                console.log('Ticket purchase successful:', ticketData);
                                fetchFilmDetails(id);
                                fetchFilmTitles();
                            })
                            .catch(error => {
                                console.error('Error posting ticket purchase:', error);
                            });
                    })
                    .catch(error => {
                        console.error('Error updating ticket count:', error);
                    });
            }
        })
        .catch(error => {
            console.error('Error fetching film details:', error);
        });
}

// Handle Delete functionality
function handleDelete(id) {
    fetch(`http://localhost:3000/films/${id}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
    })
        .then(() => {
            alert('Deleted Successfully');
            fetchFilmTitles();
        })
        .catch(error => {
            console.error('Error deleting film:', error);
        });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchFilmDetails(1);
    fetchFilmTitles();
});

// Fetch and display the details of a selected film by id
let selectedID = 1;
function fetchFilmDetails(id) {
    if (selectedID !== id) {
        selectedID = id; // Update selected ID only if it's a different film
    }
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
            document.getElementById('poster').alt = title;

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
            buyButton.onclick = (event) => handleClick(event, id); 

            fetchTickets(id);
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
            ul.innerHTML = '';
            data.forEach(film => {
                const { id, title, capacity, tickets_sold } = film;

                const li = document.createElement('li');
                li.dataset.id = id; // Store film ID in the dataset
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
                liContent.addEventListener('click', (event) => {
                    event.preventDefault();
                    fetchFilmDetails(id);
                });

                // Assign delete functionality to the delete button
                deleteButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    handleDelete(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching film titles:', error);
        });
}

// Handle the logic for reducing the number of available tickets when the button is clicked
function handleClick(event, id) {
    event.preventDefault();
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

            // If the deleted film is the currently selected one, reset the film details
            if (id === selectedID) {
                selectedID = null;
                const films = document.querySelectorAll('#films .film.item');
                if (films.length > 0) {
                    const firstFilmId = films[0].dataset.id;
                    fetchFilmDetails(firstFilmId);
                } else {
                    // Clear film details
                    document.getElementById('title').innerText = '';
                    document.getElementById('runtime').innerText = '';
                    document.getElementById('film-info').innerText = '';
                    document.getElementById('showtime').innerText = '';
                    document.getElementById('ticket-num').innerText = '';
                    document.getElementById('poster').src = '';
                    document.getElementById('poster').alt = '';
                }
            }
        })
        .catch(error => {
            console.error('Error deleting film:', error);
        });
}

// Fetch tickets and display the number of tickets purchased for a specific movie
function fetchTickets(filmId) {
    fetch(`http://localhost:3000/tickets?film_id=${filmId}`)
        .then(response => response.json())
        .then(tickets => {
            const ticketContainer = document.querySelector('.ticket-container');
            ticketContainer.innerHTML = '';

            if (tickets.length === 0) {
                const noTicketsParagraph = document.createElement('p');
                noTicketsParagraph.innerText = 'No tickets purchased for this movie yet.';
                ticketContainer.appendChild(noTicketsParagraph);
            } else {
                tickets.forEach(ticket => {
                    const ticketParagraph = document.createElement('p');
                    ticketParagraph.innerText = `Tickets bought: ${ticket.number_of_tickets}`;
                    ticketContainer.appendChild(ticketParagraph);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
        });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    fetchFilmDetails(selectedID);
    fetchFilmTitles();
});
